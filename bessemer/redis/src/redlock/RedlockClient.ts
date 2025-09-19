import { EventEmitter } from 'events'
import { RedisClient } from '@bessemer/redis/redis'
import { Assertions, Async, Crypto, Durations, Hashes, Objects, Results, Retry } from '@bessemer/cornerstone'
import { ResourceKey } from '@bessemer/cornerstone/resource-key'
import { AdvisoryLockProps } from '@bessemer/framework/advisory-lock'
import { Hash } from '@bessemer/cornerstone/hash'
import { PartialDeep } from 'type-fest'

const ACQUIRE_SCRIPT = `
  -- Return 0 if an entry already exists.
  for i, key in ipairs(KEYS) do
    if redis.call("exists", key) == 1 then
      return 0
    end
  end

  -- Create an entry for each provided key.
  for i, key in ipairs(KEYS) do
    redis.call("set", key, ARGV[1], "PX", ARGV[2])
  end

  -- Return the number of entries added.
  return #KEYS
`

const EXTEND_SCRIPT = `
  -- Return 0 if an entry exists with a *different* lock value.
  for i, key in ipairs(KEYS) do
    if redis.call("get", key) ~= ARGV[1] then
      return 0
    end
  end

  -- Update the entry for each provided key.
  for i, key in ipairs(KEYS) do
    redis.call("set", key, ARGV[1], "PX", ARGV[2])
  end

  -- Return the number of entries updated.
  return #KEYS
`

const RELEASE_SCRIPT = `
  local count = 0
  for i, key in ipairs(KEYS) do
    -- Only remove entries for *this* lock value.
    if redis.call("get", key) == ARGV[1] then
      redis.pcall("del", key)
      count = count + 1
    end
  end

  -- Return the number of entries removed.
  return count
`

export type ClientExecutionResult =
  | {
      client: RedisClient
      vote: 'for'
      value: number
    }
  | {
      client: RedisClient
      vote: 'against'
      error: Error
    }

/*
 * This object contains a summary of results. Because the result of an attempt
 * can sometimes be determined before all requests are finished, each attempt
 * contains a Promise that will resolve ExecutionStats once all requests are
 * finished. A rejection of these promises should be considered undefined
 * behavior and should cause a crash.
 */
type ExecutionResult = {
  attempts: ReadonlyArray<Promise<ExecutionStats>>
  start: number
}

export type ExecutionStats = {
  membershipSize: number
  quorumSize: number
  votesFor: Set<RedisClient>
  votesAgainst: Map<RedisClient, Error>
}

export type RedlockProps = {
  driftFactor: number
  automaticExtensionThreshold: number
}

export type RedlockOptions = PartialDeep<RedlockProps>

export const DefaultRedlockProps: RedlockProps = {
  driftFactor: 0.01,
  automaticExtensionThreshold: 500,
}

/*
 * This error indicates a failure due to the existence of another lock for one
 * or more of the requested resources.
 */
export class ResourceLockedError extends Error {
  constructor(public override readonly message: string) {
    super()
    this.name = 'ResourceLockedError'
  }
}

/*
 * This error indicates a failure of an operation to pass with a quorum.
 */
export class ExecutionError extends Error {
  constructor(public override readonly message: string, public readonly attempts: ReadonlyArray<Promise<ExecutionStats>>) {
    super()
    this.name = 'ExecutionError'
  }
}

export type RedlockLock = {
  resourceKeys: Array<ResourceKey>
  value: string
  attempts: ReadonlyArray<Promise<ExecutionStats>>
  expiration: number
}

/**
 * A redlock object is instantiated with an array of at least one redis client
 * and an optional `options` object. Properties of the Redlock object should NOT
 * be changed after it is first used, as doing so could have unintended
 * consequences for live locks.
 */
export class RedlockClient extends EventEmitter {
  public readonly clients: Set<RedisClient>
  public readonly props: RedlockProps
  public readonly scripts: Promise<{
    readonly acquireScript: { value: string; hash: Hash }
    readonly extendScript: { value: string; hash: Hash }
    readonly releaseScript: { value: string; hash: Hash }
  }>

  public constructor(clients: Iterable<RedisClient>, options: RedlockOptions = DefaultRedlockProps) {
    super()

    // Prevent crashes on error events.
    this.on('error', () => {
      // Because redlock is designed for high availability, it does not care if
      // a minority of redis instances/clusters fail at an operation.
      //
      // However, it can be helpful to monitor and log such cases. Redlock emits
      // an "error" event whenever it encounters an error, even if the error is
      // ignored in its normal operation.
      //
      // This function serves to prevent node's default behavior of crashing
      // when an "error" event is emitted in the absence of listeners.
    })

    // Create a new array of client, to ensure no accidental mutation.
    this.clients = new Set(clients)
    Assertions.assert(this.clients.size !== 0, () => 'Redlock must be instantiated with at least one redis client.')

    this.props = Objects.deepMerge(DefaultRedlockProps, options)

    this.scripts = Async.execute(async () => {
      return {
        acquireScript: {
          value: ACQUIRE_SCRIPT,
          hash: await Hashes.insecureHash(ACQUIRE_SCRIPT),
        },
        extendScript: {
          value: EXTEND_SCRIPT,
          hash: await Hashes.insecureHash(EXTEND_SCRIPT),
        },
        releaseScript: {
          value: RELEASE_SCRIPT,
          hash: await Hashes.insecureHash(RELEASE_SCRIPT),
        },
      }
    })
  }

  /**
   * This method runs `.quit()` on all client connections.
   */
  quit = async (): Promise<void> => {
    const results = []
    for (const client of this.clients) {
      results.push(client.quit())
    }

    await Promise.all(results)
  }

  /**
   * This method acquires a locks on the resources for the duration specified by
   * the `duration`.
   */
  // JOHN maybe shouldnt be using the AdvisoryLockProps here even tho they contain the props we want?
  // JOHN should this take a context object instead of relying on its internal dealio?
  acquire = async (resourceKeys: Array<ResourceKey>, props: AdvisoryLockProps): Promise<RedlockLock> => {
    const durationMs = Durations.toMilliseconds(props.duration)
    Assertions.assert(Number.isInteger(durationMs), () => 'Duration must be an integer value')

    const value = Crypto.getRandomHex(16)

    try {
      const { attempts, start } = await this.executeScript((await this.scripts).acquireScript, resourceKeys, [value, durationMs], props)

      // Add 2 milliseconds to the drift to account for Redis expires precision,
      // which is 1 ms, plus the configured allowable drift factor.
      const drift = Math.round(this.props.driftFactor * durationMs) + 2

      return {
        resourceKeys,
        value,
        attempts,
        expiration: start + durationMs - drift,
      }
    } catch (error) {
      try {
        // If there was an error acquiring the lock, release any partial lock
        // state that may exist on a minority of clients.
        await this.executeScript((await this.scripts).releaseScript, resourceKeys, [value], {
          ...props,
          retry: Retry.None,
        })
      } catch (e) {
        // Any error here will be ignored.
      }

      throw error
    }
  }

  /**
   * This method unlocks the provided lock from all servers still persisting it.
   * It will fail with an error if it is unable to release the lock on a quorum
   * of nodes, but will make no attempt to restore the lock in the case of a
   * failure to release. It is safe to re-attempt a release or to ignore the
   * error, as the lock will automatically expire after its timeout.
   */
  public async release(lock: RedlockLock, props: AdvisoryLockProps): Promise<ExecutionResult> {
    // Immediately invalidate the lock.
    lock.expiration = 0

    // Attempt to release the lock.
    return this.executeScript((await this.scripts).releaseScript, lock.resourceKeys, [lock.value], props)
  }

  /**
   * This method extends a valid lock by the provided `duration`.
   */
  public async extend(existing: RedlockLock, props: AdvisoryLockProps): Promise<RedlockLock> {
    const durationMs = Durations.toMilliseconds(props.duration)
    Assertions.assert(Number.isInteger(durationMs), () => 'Duration must be an integer value')
    Assertions.assert(existing.expiration >= Date.now(), () => 'Cannot extend an already-expired lock.')

    const { attempts, start } = await this.executeScript(
      (
        await this.scripts
      ).extendScript,
      existing.resourceKeys,
      [existing.value, durationMs],
      props
    )

    // Invalidate the existing lock.
    existing.expiration = 0

    // Add 2 milliseconds to the drift to account for Redis expires precision,
    // which is 1 ms, plus the configured allowable drift factor.
    const drift = Math.round(this.props.driftFactor * durationMs) + 2

    const replacement: RedlockLock = {
      resourceKeys: existing.resourceKeys,
      value: existing.value,
      attempts,
      expiration: start + durationMs - drift,
    }

    return replacement
  }

  /**
   * Execute a script on all clients. The resulting promise is resolved or
   * rejected as soon as this quorum is reached; the resolution or rejection
   * will contains a `stats` property that is resolved once all votes are in.
   */
  private executeScript = async (
    script: { value: string; hash: string },
    resourceKeys: Array<ResourceKey>,
    args: Array<string | number>,
    props: AdvisoryLockProps
  ): Promise<ExecutionResult> => {
    const attempts: Promise<ExecutionStats>[] = []

    const result = await Retry.usingRetry(async () => {
      const { vote, stats, start } = await this.attemptOperation(script, resourceKeys, args)
      attempts.push(stats)

      if (vote === 'against') {
        return Results.failure()
      }

      return Results.success({ attempts, start })
    }, props.retry)

    if (!result.isSuccess) {
      throw new ExecutionError('The operation was unable to achieve a quorum during its retry window.', attempts)
    }

    return result.value
  }

  private attemptOperation = async (
    script: { value: string; hash: string },
    resourceKeys: Array<ResourceKey>,
    args: (string | number)[]
  ): Promise<{ vote: 'for'; stats: Promise<ExecutionStats>; start: number } | { vote: 'against'; stats: Promise<ExecutionStats>; start: number }> => {
    const start = Date.now()

    return await new Promise((resolve) => {
      const clientResults = []
      for (const client of this.clients) {
        clientResults.push(this.attemptOperationOnClient(client, script, resourceKeys, args))
      }

      const stats: ExecutionStats = {
        membershipSize: clientResults.length,
        quorumSize: Math.floor(clientResults.length / 2) + 1,
        votesFor: new Set<RedisClient>(),
        votesAgainst: new Map<RedisClient, Error>(),
      }

      let done: () => void
      const statsPromise = new Promise<typeof stats>((resolve) => {
        done = () => resolve(stats)
      })

      // This is the expected flow for all successful and unsuccessful requests.
      const onResultResolve = (clientResult: ClientExecutionResult): void => {
        switch (clientResult.vote) {
          case 'for':
            stats.votesFor.add(clientResult.client)
            break
          case 'against':
            stats.votesAgainst.set(clientResult.client, clientResult.error)
            break
        }

        // A quorum has determined a success.
        if (stats.votesFor.size === stats.quorumSize) {
          resolve({
            vote: 'for',
            stats: statsPromise,
            start,
          })
        }

        // A quorum has determined a failure.
        if (stats.votesAgainst.size === stats.quorumSize) {
          resolve({
            vote: 'against',
            stats: statsPromise,
            start,
          })
        }

        // All votes are in.
        if (stats.votesFor.size + stats.votesAgainst.size === stats.membershipSize) {
          done()
        }
      }

      // This is unexpected and should crash to prevent undefined behavior.
      const onResultReject = (error: Error): void => {
        throw error
      }

      for (const result of clientResults) {
        result.then(onResultResolve, onResultReject)
      }
    })
  }

  private attemptOperationOnClient = async (
    client: RedisClient,
    script: { value: string; hash: string },
    resourceKeys: Array<ResourceKey>,
    args: (string | number)[]
  ): Promise<ClientExecutionResult> => {
    try {
      let result: number
      try {
        // Attempt to evaluate the script by its hash.
        const shaResult = (await client.evalsha(script.hash, resourceKeys.length, ...[...resourceKeys, ...args])) as unknown

        if (typeof shaResult !== 'number') {
          throw new Error(`Unexpected result of type ${typeof shaResult} returned from redis.`)
        }

        result = shaResult
      } catch (error) {
        // If the redis server does not already have the script cached,
        // reattempt the request with the script's raw text.
        if (!(error instanceof Error) || !error.message.startsWith('NOSCRIPT')) {
          throw error
        }

        const rawResult = (await client.eval(script.value, resourceKeys.length, ...[...resourceKeys, ...args])) as unknown

        if (typeof rawResult !== 'number') {
          throw new Error(`Unexpected result of type ${typeof rawResult} returned from redis.`)
        }

        result = rawResult
      }

      // One or more of the resources was already locked.
      if (result !== resourceKeys.length) {
        throw new ResourceLockedError(`The operation was applied to: ${result} of the ${resourceKeys.length} requested resources.`)
      }

      return {
        vote: 'for',
        client,
        value: result,
      }
    } catch (error) {
      if (!(error instanceof Error)) {
        throw new Error(`Unexpected type ${typeof error} thrown with value: ${error}`)
      }

      // Emit the error on the redlock instance for observability.
      this.emit('error', error)

      return {
        vote: 'against',
        client,
        error,
      }
    }
  }

  /**
   * Wrap and execute a routine in the context of an auto-extending lock,
   * returning a promise of the routine's value. In the case that auto-extension
   * fails, an AbortSignal will be updated to indicate that abortion of the
   * routine is in order, and to pass along the encountered error.
   *
   * @example
   * ```ts
   * await redlock.using([senderId, recipientId], 5000, { retryCount: 5 }, async (signal) => {
   *   const senderBalance = await getBalance(senderId);
   *   const recipientBalance = await getBalance(recipientId);
   *
   *   if (senderBalance < amountToSend) {
   *     throw new Error("Insufficient balance.");
   *   }
   *
   *   // The abort signal will be true if:
   *   // 1. the above took long enough that the lock needed to be extended
   *   // 2. redlock was unable to extend the lock
   *   //
   *   // In such a case, exclusivity can no longer be guaranteed for further
   *   // operations, and should be handled as an exceptional case.
   *   if (signal.aborted) {
   *     throw signal.error;
   *   }
   *
   *   await setBalances([
   *     {id: senderId, balance: senderBalance - amountToSend},
   *     {id: recipientId, balance: recipientBalance + amountToSend},
   *   ]);
   * });
   * ```
   */

  // JOHN we don't leverage these using methods because it happens outside of the provider level... but we might be able to make use of the code
  // public async using<T>(
  //   resources: string[],
  //   duration: number,
  //   settings: Partial<RedlockSettings>,
  //   routine?: (signal: RedlockAbortSignal) => Promise<T>
  // ): Promise<T>
  //
  // public async using<T>(resources: string[], duration: number, routine: (signal: RedlockAbortSignal) => Promise<T>): Promise<T>
  //
  // public async using<T>(
  //   resources: string[],
  //   duration: number,
  //   settingsOrRoutine: undefined | Partial<RedlockSettings> | ((signal: RedlockAbortSignal) => Promise<T>),
  //   optionalRoutine?: (signal: RedlockAbortSignal) => Promise<T>
  // ): Promise<T> {
  //   if (Math.floor(duration) !== duration) {
  //     throw new Error('Duration must be an integer value in milliseconds.')
  //   }
  //
  //   const settings =
  //     settingsOrRoutine && typeof settingsOrRoutine !== 'function'
  //       ? {
  //           ...this.settings,
  //           ...settingsOrRoutine,
  //         }
  //       : this.settings
  //
  //   const routine = optionalRoutine ?? settingsOrRoutine
  //   if (typeof routine !== 'function') {
  //     throw new Error('INVARIANT: routine is not a function.')
  //   }
  //
  //   if (settings.automaticExtensionThreshold > duration - 100) {
  //     throw new Error('A lock `duration` must be at least 100ms greater than the `automaticExtensionThreshold` setting.')
  //   }
  //
  //   // The AbortController/AbortSignal pattern allows the routine to be notified
  //   // of a failure to extend the lock, and subsequent expiration. In the event
  //   // of an abort, the error object will be made available at `signal.error`.
  //   const controller = new AbortController()
  //
  //   const signal = controller.signal as RedlockAbortSignal
  //
  //   function queue(): void {
  //     timeout = setTimeout(() => (extension = extend()), lock.expiration - Date.now() - settings.automaticExtensionThreshold)
  //   }
  //
  //   async function extend(): Promise<void> {
  //     timeout = undefined
  //
  //     try {
  //       lock = await lock.extend(duration)
  //       queue()
  //     } catch (error) {
  //       if (!(error instanceof Error)) {
  //         throw new Error(`Unexpected thrown ${typeof error}: ${error}.`)
  //       }
  //
  //       if (lock.expiration > Date.now()) {
  //         return (extension = extend())
  //       }
  //
  //       signal.error = error
  //       controller.abort()
  //     }
  //   }
  //
  //   let timeout: undefined | NodeJS.Timeout
  //   let extension: undefined | Promise<void>
  //   let lock = await this.acquire(resources, duration, settings)
  //   queue()
  //
  //   try {
  //     return await routine(signal)
  //   } finally {
  //     // Clean up the timer.
  //     if (timeout) {
  //       clearTimeout(timeout)
  //       timeout = undefined
  //     }
  //
  //     // Wait for an in-flight extension to finish.
  //     if (extension) {
  //       await extension.catch(() => {
  //         // An error here doesn't matter at all, because the routine has
  //         // already completed, and a release will be attempted regardless. The
  //         // only reason for waiting here is to prevent possible contention
  //         // between the extension and release.
  //       })
  //     }
  //
  //     await lock.release()
  //   }
  // }
}
