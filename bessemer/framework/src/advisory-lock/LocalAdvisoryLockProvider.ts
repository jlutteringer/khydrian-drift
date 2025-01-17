import { AbstractApplicationContext } from '@bessemer/cornerstone/context'
import { AsyncResult } from '@bessemer/cornerstone/result'
import { AdvisoryLock, AdvisoryLockProps, AdvisoryLockProvider, ProviderAdvisoryLock } from '@bessemer/framework/advisory-lock'
import { Arrays, Dates, Durations, Eithers, Objects, Results, Retry, Uuids } from '@bessemer/cornerstone'
import { Uuid } from '@bessemer/cornerstone/uuid'
import { Unit } from '@bessemer/cornerstone/unit'
import { ResourceKey } from '@bessemer/cornerstone/resource'
import { Either } from '@bessemer/cornerstone/either'
import { Duration } from '@bessemer/cornerstone/duration'
import { AdvisoryLockUtil } from '@bessemer/framework/advisory-lock/util'

export type LocalProviderAdvisoryLock = Array<LocalResourceLock> & ProviderAdvisoryLock

type LocalResourceLock = {
  id: Uuid
  resourceKey: ResourceKey
  expires: Date
}

export class LocalAdvisoryLockProvider implements AdvisoryLockProvider {
  private expiryMap: Map<string, LocalResourceLock>

  constructor() {
    this.expiryMap = new Map()
    setInterval(() => this.garbageCollect(), Durations.inMilliseconds(Durations.ofSeconds(60)))
  }

  acquireLock = async (
    resourceKeys: Array<ResourceKey>,
    props: AdvisoryLockProps,
    _: AbstractApplicationContext
  ): AsyncResult<ProviderAdvisoryLock> => {
    const locks: LocalProviderAdvisoryLock = []
    let resourceKeysToProcess = resourceKeys

    const result = await Retry.usingRetry(async () => {
      for (const resourceKey of resourceKeysToProcess) {
        const existingLock = this.expiryMap.get(resourceKey)
        if (Objects.isPresent(existingLock) && Dates.isAfter(existingLock.expires, Dates.now())) {
          return Results.failure(AdvisoryLockUtil.buildLockLockedError(resourceKey))
        }

        const lock: LocalResourceLock = {
          id: Uuids.random(),
          resourceKey,
          expires: Dates.addDuration(Dates.now(), props.duration),
        }

        locks.push(lock)
        resourceKeysToProcess = Arrays.remove(resourceKeysToProcess, resourceKey)
      }

      return Results.success(Unit)
    }, props.retry)

    if (!result.isSuccess) {
      return result
    }

    const extendedLocks = this.extendLocks(locks, props.duration)
    return Results.success(extendedLocks)
  }

  extendLock = async (lock: AdvisoryLock, context: AbstractApplicationContext): AsyncResult<ProviderAdvisoryLock> => {
    const [resources, locks] = Arrays.split(this.getUnderlyingLocks(lock))

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
        id: Uuids.random(),
        resourceKey: it.resourceKey,
        expires: Dates.addDuration(Dates.now(), duration),
      }

      this.expiryMap.set(it.resourceKey, newLock)
      return newLock
    })

    return extendedLocks
  }

  releaseLock = async (lock: AdvisoryLock, _: AbstractApplicationContext): AsyncResult<Unit> => {
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

      if (Dates.isBefore(matchingLock.expires, Dates.now())) {
        return Eithers.left(it)
      }

      return Eithers.right(matchingLock)
    })
  }

  private garbageCollect = (): void => {
    const now = Dates.now()
    for (const [key, lock] of this.expiryMap.entries()) {
      if (Dates.isAfter(lock.expires, now)) {
        this.expiryMap.delete(key)
      }
    }
  }
}
