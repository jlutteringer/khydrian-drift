import { AsyncResult } from '@bessemer/cornerstone/result'
import { AdvisoryLock, AdvisoryLockProps, AdvisoryLockProvider, ProviderAdvisoryLock } from '@bessemer/framework/advisory-lock'
import { Results } from '@bessemer/cornerstone'
import { Unit } from '@bessemer/cornerstone/unit'
import { RedisApplicationContext } from '@bessemer/redis/application'
import { RedlockClient, RedlockLock } from '@bessemer/redis/redlock/RedlockClient'
import { Redis } from '@bessemer/redis'
import { ResourceKey } from '@bessemer/cornerstone/resource-key'
import { GlobalContextType } from '@bessemer/framework'

export class RedisAdvisoryLockProvider implements AdvisoryLockProvider<RedisApplicationContext> {
  acquireLock = async (
    resourceKeys: Array<ResourceKey>,
    props: AdvisoryLockProps,
    context: GlobalContextType<RedisApplicationContext>
  ): AsyncResult<ProviderAdvisoryLock> => {
    const redlock = new RedlockClient([Redis.getClient(context.global.redis)])

    return await Results.tryValue(async () => {
      const lock = await redlock.acquire(resourceKeys, props)
      return lock as ProviderAdvisoryLock
    })
  }

  extendLock = async (lock: AdvisoryLock, context: GlobalContextType<RedisApplicationContext>): AsyncResult<ProviderAdvisoryLock> => {
    const redlock = new RedlockClient([Redis.getClient(context.global.redis)])

    return await Results.tryValue(async () => {
      const providerLock = await redlock.extend(lock.providerLock as RedlockLock, lock.props)
      return providerLock as ProviderAdvisoryLock
    })
  }

  releaseLock = async (lock: AdvisoryLock, context: GlobalContextType<RedisApplicationContext>): AsyncResult<Unit> => {
    const redlock = new RedlockClient([Redis.getClient(context.global.redis)])

    return Results.tryValue(async () => {
      await redlock.release(lock.providerLock as RedlockLock, lock.props)
      return Unit
    })
  }
}
