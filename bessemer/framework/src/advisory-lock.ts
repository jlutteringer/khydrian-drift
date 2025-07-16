import { Duration } from '@bessemer/cornerstone/duration'
import { RetryProps } from '@bessemer/cornerstone/retry'
import { NominalType } from '@bessemer/cornerstone/types'
import { Arrays, Assertions, Durations, Loggers, Objects, Results, Retry } from '@bessemer/cornerstone'
import { BessemerApplicationContext, GlobalContextType } from '@bessemer/framework/index'
import { AbstractApplicationContext } from '@bessemer/cornerstone/context'
import { AsyncResult } from '@bessemer/cornerstone/result'
import { Unit } from '@bessemer/cornerstone/unit'
import { ResourceKey } from '@bessemer/cornerstone/resource'
import { Entry } from '@bessemer/cornerstone/entry'
import { Arrayable, PartialDeep } from 'type-fest'

const logger = Loggers.child('AdvisoryLock')

export type AdvisoryLockProps = {
  duration: Duration
  retry: RetryProps
}

export type AdvisoryLockOptions = PartialDeep<AdvisoryLockProps>

export const DefaultAdvisoryLockProps: AdvisoryLockProps = {
  duration: Durations.fromSeconds(5),
  retry: {
    attempts: 10,
    delay: Durations.fromMilliseconds(300),
  },
}

export type AdvisoryLock = {
  resourceKeys: Array<ResourceKey>
  props: AdvisoryLockProps
  providerLock: ProviderAdvisoryLock // The underlying provider's lock object
}

export type ProviderAdvisoryLock = NominalType<unknown, 'ProviderAdvisoryLock'>

export interface AdvisoryLockProvider<ContextType extends AbstractApplicationContext = AbstractApplicationContext> {
  acquireLock: (
    resourceKeys: Array<ResourceKey>,
    props: AdvisoryLockProps,
    context: GlobalContextType<ContextType>
  ) => AsyncResult<ProviderAdvisoryLock>
  extendLock: (lock: AdvisoryLock, context: GlobalContextType<ContextType>) => AsyncResult<ProviderAdvisoryLock>
  releaseLock: (lock: AdvisoryLock, context: GlobalContextType<ContextType>) => AsyncResult<Unit>
}

const getProvider = (context: GlobalContextType<BessemerApplicationContext>): AdvisoryLockProvider => {
  return context.global.advisoryLockProvider
}

export const usingLock = async <T>(
  resourceKeys: Arrayable<ResourceKey>,
  context: GlobalContextType<BessemerApplicationContext>,
  computeValue: () => Promise<T>,
  options: AdvisoryLockOptions = {}
): Promise<T> => {
  const lock = await acquireLock(resourceKeys, context, options)
  if (!lock.isSuccess) {
    return computeValue()
  }

  return withLock(lock.value, context, computeValue, options)
}

export const usingIncrementalLocks = async <T>(
  resourceKeys: Array<ResourceKey>,
  context: GlobalContextType<BessemerApplicationContext>,
  fetchIncrementalValues: (resourceKeys: Array<ResourceKey>) => Promise<Array<Entry<T>>>,
  computeValues: (resourceKeys: Array<ResourceKey>) => Promise<Array<Entry<T>>>,
  options: AdvisoryLockOptions = {}
): Promise<Array<Entry<T>>> => {
  let remainingKeys = resourceKeys
  const incrementalResults: Array<Entry<T>> = []

  const result = await Retry.usingRetry(async () => {
    logger.trace(() => `usingIncrementalLocks - Fetching incremental values: ${JSON.stringify(remainingKeys)}`)
    const incrementalValues = await fetchIncrementalValues(remainingKeys)

    incrementalResults.push(...incrementalValues)
    remainingKeys = remainingKeys.filter((it) => !incrementalValues.find(([key, _]) => key === it))

    if (Arrays.isEmpty(remainingKeys)) {
      return Results.success(incrementalResults)
    }

    logger.trace(() => `usingIncrementalLocks - Unresolved incremental values: ${JSON.stringify(remainingKeys)}`)

    const lock = await tryAcquireLock(remainingKeys, context, options)
    if (lock.isSuccess) {
      const values = await withLock(lock.value, context, async () => {
        return await computeValues(remainingKeys)
      })

      return Results.success([...incrementalResults, ...values])
    }

    return Results.failure()
  }, options.retry)

  if (!result.isSuccess) {
    const values = await computeValues(remainingKeys)
    return [...incrementalResults, ...values]
  }

  return result.value
}

export const usingOptimisticLock = async <T>(
  resourceKeys: Arrayable<ResourceKey>,
  context: GlobalContextType<BessemerApplicationContext>,
  testValue: () => Promise<T | undefined>,
  computeValue: () => Promise<T>,
  options: AdvisoryLockOptions = {}
): Promise<T> => {
  const result = await Retry.usingRetry(async () => {
    const result = await testValue()
    if (Objects.isPresent(result)) {
      return Results.success(result)
    }

    const lock = await tryAcquireLock(resourceKeys, context, options)
    if (lock.isSuccess) {
      const value = await withLock(lock.value, context, async () => {
        return await computeValue()
      })

      return Results.success(value)
    }

    return Results.failure()
  }, options.retry)

  if (!result.isSuccess) {
    return await computeValue()
  }

  return result.value
}

const withLock = async <T>(
  lock: AdvisoryLock,
  context: GlobalContextType<BessemerApplicationContext>,
  computeValue: () => Promise<T>,
  options: AdvisoryLockOptions = {}
): Promise<T> => {
  // JOHN automatically extend lock in here ?

  try {
    const value = await computeValue()
    return value
  } finally {
    await releaseLock(lock, context)
  }
}

export const tryAcquireLock = async (
  resourceKeys: Arrayable<ResourceKey>,
  context: GlobalContextType<BessemerApplicationContext>,
  options: AdvisoryLockOptions = {}
): AsyncResult<AdvisoryLock> => {
  return await acquireLock(resourceKeys, context, { ...options, retry: Retry.None })
}

export const acquireLock = async (
  resourceKeys: Arrayable<ResourceKey>,
  context: GlobalContextType<BessemerApplicationContext>,
  options: AdvisoryLockOptions = {}
): AsyncResult<AdvisoryLock> => {
  Assertions.assertFalse(Arrays.isEmpty(Arrays.toArray(resourceKeys)), () => `Illegal call to acquireLock with empty resourceKeys`)

  const sortedKeys = Arrays.sort(Arrays.toArray(resourceKeys))
  const props = Objects.deepMerge(DefaultAdvisoryLockProps, options)

  logger.trace(() => `acquireLock - Attempting to acquire lock for keys: ${JSON.stringify(sortedKeys)}`)

  const providerLock = await getProvider(context).acquireLock(sortedKeys, props, context)

  logger.trace(() => {
    if (providerLock.isSuccess) {
      return `acquireLock - Successfully acquired lock for keys: ${JSON.stringify(sortedKeys)}`
    } else {
      return `acquireLock - Failed to acquire lock for keys: ${JSON.stringify(sortedKeys)}`
    }
  })

  return Results.map(providerLock, (it) => {
    return {
      resourceKeys: sortedKeys,
      props,
      providerLock: it,
    }
  })
}

export const extendLock = async (lock: AdvisoryLock, context: GlobalContextType<BessemerApplicationContext>): AsyncResult<AdvisoryLock> => {
  const providerLock = await getProvider(context).extendLock(lock, context)

  return Results.map(providerLock, (it) => {
    return {
      resourceKeys: lock.resourceKeys,
      props: lock.props,
      providerLock: it,
    }
  })
}

export const releaseLock = (lock: AdvisoryLock, context: GlobalContextType<BessemerApplicationContext>): AsyncResult<Unit> => {
  return getProvider(context).releaseLock(lock, context)
}
