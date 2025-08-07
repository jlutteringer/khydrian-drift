import IoRedis, { Cluster as IORedisCluster, Redis as IORedisClient } from 'ioredis'
import { RedisClientContext } from '@bessemer/redis/application'
import { Assertions } from '@bessemer/cornerstone'

export type RedisSingletonClient = IORedisClient
export type RedisClusterClient = IORedisCluster
export type RedisClient = RedisSingletonClient | RedisClusterClient

// JOHN
// export const getStore = <T>(namespace: StoreKey, context: TenantContext, timeToLive?: Millisecond): RemoteKeyValueStore<T> => {
//   return new RedisStore<T>(namespace, context, timeToLive)
// }

export const getClient = (context: RedisClientContext | undefined): RedisClient => {
  Assertions.assertPresent(context, () => 'Application attempted to obtain a RedisClient without setting options.redis configuration')

  // const redisClientCache = CacheService.getLocalCache<RedisClient>('RedisProvider.clientCache', context)
  // return redisClientCache.getValue(['RedisClient'], () => {
  //   const client = new Redis(context.tenant.redis?.connectionUrl!)
  //   return client
  // })

  return new IoRedis(context.connectionUrl)
}
