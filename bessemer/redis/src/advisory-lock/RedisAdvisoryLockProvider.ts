import { AsyncResult } from '@bessemer/cornerstone/result'
import { AdvisoryLock, AdvisoryLockProps, AdvisoryLockProvider, ProviderAdvisoryLock } from '@bessemer/framework/advisory-lock'
import { Results } from '@bessemer/cornerstone'
import { Unit } from '@bessemer/cornerstone/unit'
import { RedisApplicationContext } from '@bessemer/redis/application'
import { RedlockClient, RedlockLock } from '@bessemer/redis/redlock/RedlockClient'
import { Redis } from '@bessemer/redis'
import { ResourceKey } from '@bessemer/cornerstone/resource'

export class RedisAdvisoryLockProvider implements AdvisoryLockProvider<RedisApplicationContext> {
  acquireLock = async (
    resourceKeys: Array<ResourceKey>,
    props: AdvisoryLockProps,
    context: RedisApplicationContext
  ): AsyncResult<ProviderAdvisoryLock> => {
    const redlock = new RedlockClient([Redis.getClient(context)])
    try {
      const lock = await redlock.acquire(resourceKeys, props)
      return Results.success(lock as ProviderAdvisoryLock)
    } catch (e) {
      // JOHN
      return Results.failure()
    }
  }

  extendLock = async (lock: AdvisoryLock, context: RedisApplicationContext): AsyncResult<ProviderAdvisoryLock> => {
    const redlock = new RedlockClient([Redis.getClient(context)])
    try {
      const providerLock = await redlock.extend(lock.providerLock as RedlockLock, lock.props)
      return Results.success(providerLock as ProviderAdvisoryLock)
    } catch (e) {
      // JOHN
      return Results.failure()
    }
  }

  releaseLock = async (lock: AdvisoryLock, context: RedisApplicationContext): AsyncResult<Unit> => {
    const redlock = new RedlockClient([Redis.getClient(context)])
    try {
      await redlock.release(lock.providerLock as RedlockLock, lock.props)
      return Results.success(Unit)
    } catch (e) {
      // JOHN
      return Results.failure()
    }
  }
}
