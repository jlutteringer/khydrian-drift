import { AbstractApplicationContext } from '@bessemer/cornerstone/context'
import { AsyncResult } from '@bessemer/cornerstone/result'
import { AdvisoryLock, AdvisoryLockProps, AdvisoryLockProvider, ProviderAdvisoryLock } from '@bessemer/framework/advisory-lock'
import { Arrays, Durations, Eithers, Instants, Objects, Results, Retry, Ulids } from '@bessemer/cornerstone'
import { Unit } from '@bessemer/cornerstone/unit'
import { Either } from '@bessemer/cornerstone/either'
import { Duration } from '@bessemer/cornerstone/temporal/duration'
import { AdvisoryLockUtil } from '@bessemer/framework/advisory-lock/util'
import { ResourceKey } from '@bessemer/cornerstone/resource-key'
import { Ulid } from '@bessemer/cornerstone/uuid/ulid'
import { GlobalContextType } from '@bessemer/framework'
import { Instant } from '@bessemer/cornerstone/temporal/instant'

export type LocalProviderAdvisoryLock = Array<LocalResourceLock> & ProviderAdvisoryLock

type LocalResourceLock = {
  id: Ulid
  resourceKey: ResourceKey
  expires: Instant
}

export class LocalAdvisoryLockProvider implements AdvisoryLockProvider {
  private expiryMap: Map<string, LocalResourceLock>

  constructor() {
    this.expiryMap = new Map()
    setInterval(() => this.garbageCollect(), Durations.toMilliseconds(Durations.fromSeconds(60)))
  }

  acquireLock = async (
    resourceKeys: Array<ResourceKey>,
    props: AdvisoryLockProps,
    _: GlobalContextType<AbstractApplicationContext>
  ): AsyncResult<ProviderAdvisoryLock> => {
    const result = await Retry.usingRetry(async () => {
      const locks: Array<LocalResourceLock> = []
      for (const resourceKey of resourceKeys) {
        const existingLock = this.expiryMap.get(resourceKey)
        if (Objects.isPresent(existingLock) && Instants.isAfter(existingLock.expires, Instants.now())) {
          return Results.failure(AdvisoryLockUtil.buildLockLockedError(resourceKey))
        }

        const lock: LocalResourceLock = {
          id: Ulids.generate(),
          resourceKey,
          expires: Instants.add(Instants.now(), props.duration),
        }

        locks.push(lock)
      }

      return Results.success(locks)
    }, props.retry)

    if (!result.isSuccess) {
      return result
    }

    const extendedLocks = this.extendLocks(result.value, props.duration)
    return Results.success(extendedLocks)
  }

  extendLock = async (lock: AdvisoryLock, context: GlobalContextType<AbstractApplicationContext>): AsyncResult<ProviderAdvisoryLock> => {
    const [resources, locks] = Eithers.split(this.getUnderlyingLocks(lock))

    let locksToExtend = locks

    if (!Arrays.isEmpty(resources)) {
      const result = await this.acquireLock(resources, lock.props, context)
      if (!result.isSuccess) {
        return result
      }

      locksToExtend = Arrays.concatenate(locksToExtend, result.value as LocalProviderAdvisoryLock)
    }

    const extendedLocks = this.extendLocks(locksToExtend, lock.props.duration)
    return Results.success(extendedLocks)
  }

  private extendLocks = (locks: Array<LocalResourceLock>, duration: Duration): LocalProviderAdvisoryLock => {
    const extendedLocks: LocalProviderAdvisoryLock = locks.map((it) => {
      const newLock: LocalResourceLock = {
        id: Ulids.generate(),
        resourceKey: it.resourceKey,
        expires: Instants.add(Instants.now(), duration),
      }

      this.expiryMap.set(it.resourceKey, newLock)
      return newLock
    })

    return extendedLocks
  }

  releaseLock = async (lock: AdvisoryLock, _: GlobalContextType<AbstractApplicationContext>): AsyncResult<Unit> => {
    const result = this.getUnderlyingLocks(lock).filter(Eithers.isRight)
    result.forEach((it) => this.expiryMap.delete(it.value.resourceKey))
    return Results.success(Unit)
  }

  private getUnderlyingLocks = (lock: AdvisoryLock): Array<Either<ResourceKey, LocalResourceLock>> => {
    return lock.resourceKeys.map((it) => {
      const existingLock = this.expiryMap.get(it)
      if (Objects.isNil(existingLock)) {
        return Eithers.left(it)
      }

      const underlyingLocks = lock.providerLock as LocalProviderAdvisoryLock
      const matchingLock = underlyingLocks.find((it) => it.id === existingLock.id)
      if (Objects.isNil(matchingLock)) {
        return Eithers.left(it)
      }

      if (Instants.isBefore(matchingLock.expires, Instants.now())) {
        return Eithers.left(it)
      }

      return Eithers.right(matchingLock)
    })
  }

  private garbageCollect = (): void => {
    const now = Instants.now()
    for (const [key, lock] of this.expiryMap.entries()) {
      if (Instants.isAfter(lock.expires, now)) {
        this.expiryMap.delete(key)
      }
    }
  }
}
