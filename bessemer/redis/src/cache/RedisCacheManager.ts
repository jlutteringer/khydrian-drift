import { CacheName } from '@bessemer/cornerstone/cache'
import { CacheManager, LocalCacheManager } from '@bessemer/framework/cache/cache-manager'
import { RedisApplicationContext } from '@bessemer/redis/application'
import { GlobalContextType } from '@bessemer/framework'
import { Redis } from '@bessemer/redis'
import { Loggers, ResourceKeys } from '@bessemer/cornerstone'
import { CacheDetail, CacheEvictRequest, CacheSummary, CacheWriteRequest } from '@bessemer/client/cache/types'

export enum RedisCacheMutationType {
  Write = 'Write',
  Evict = 'Evict',
}

export type RedisCacheMutation = {} & (
  | {
      type: RedisCacheMutationType.Write
      request: CacheWriteRequest
    }
  | {
      type: RedisCacheMutationType.Evict
      request: CacheEvictRequest
    }
)

const logger = Loggers.child('RedisCacheManager')

export class RedisCacheManager implements CacheManager<RedisApplicationContext> {
  private readonly localCacheManager: LocalCacheManager

  constructor() {
    this.localCacheManager = new LocalCacheManager()
  }

  initialize = (context: GlobalContextType<RedisApplicationContext>) => {
    logger.info(() => `Initializing RedisCacheManager at ${context.global.redis?.connectionUrl}`)

    const client = Redis.getClient(context.global.redis)

    client.subscribe(this.getChannel(context), (err, count) => {
      // JOHN how to handle?
      if (err) {
        // Just like other commands, subscribe() can fail for some reasons,
        // ex network issues.
        console.error('Failed to subscribe: %s', err.message)
      }
    })

    client.on('message', async (channel, message) => {
      if (channel !== this.getChannel(context)) {
        return
      }

      const mutation: RedisCacheMutation = JSON.parse(message)
      if (mutation.type === RedisCacheMutationType.Write) {
        logger.trace(() => `Received cache write: ${JSON.stringify(mutation.request)}`)
        await this.localCacheManager.writeValues(mutation.request)
      } else {
        logger.trace(() => `Received cache evict: ${JSON.stringify(mutation.request)}`)
        await this.localCacheManager.evictValues(mutation.request)
      }
    })
  }

  writeValues = async (request: CacheWriteRequest, context: GlobalContextType<RedisApplicationContext>): Promise<void> => {
    const client = Redis.getClient(context.global.redis)
    const message = { type: RedisCacheMutationType.Write, request }
    client.publish(this.getChannel(context), JSON.stringify(message))
  }

  evictValues = async (request: CacheEvictRequest, context: GlobalContextType<RedisApplicationContext>): Promise<void> => {
    const client = Redis.getClient(context.global.redis)
    const message = { type: RedisCacheMutationType.Evict, request }
    client.publish(this.getChannel(context), JSON.stringify(message))
  }

  private getChannel = (context: GlobalContextType<RedisApplicationContext>): string => {
    return ResourceKeys.applyNamespace('RedisCacheManager', ResourceKeys.namespace(context.global.buildId))
  }

  getCaches = async (context: GlobalContextType<RedisApplicationContext>): Promise<Array<CacheSummary>> => {
    return this.localCacheManager.getCaches()
  }

  getCacheDetails = async (name: CacheName, context: GlobalContextType<RedisApplicationContext>): Promise<CacheDetail | null> => {
    return this.localCacheManager.getCacheDetails(name)
  }
}
