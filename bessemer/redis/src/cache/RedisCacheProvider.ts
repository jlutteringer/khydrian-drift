// JOHN can be rewritten to use the RedisStore?
// JOHN need to deal with cache values changing in between application version changes ;_;
import { CacheEntry, CacheKey, CacheProps, CacheProvider, CacheProviderRegistry, CacheProviderType, CacheSection } from '@bessemer/cornerstone/cache'
import { Objects, Preconditions } from '@bessemer/cornerstone'
import { Redis } from '@bessemer/redis'
import { RedisApplicationContext } from '@bessemer/redis/application'
import { RedisStore } from '@bessemer/redis/store/RedisStore'
import { ResourceKey } from '@bessemer/cornerstone/resource'

export namespace RedisCacheProvider {
  export const Type: CacheProviderType = 'RedisCacheProvider'

  export const register = (): CacheProviderRegistry<RedisApplicationContext> => {
    return {
      type: Type,
      constructor: (props: CacheProps, context: RedisApplicationContext) => {
        return new RedisCacheProviderImpl(props, context)
      },
    }
  }
}

export class RedisCacheProviderImpl<T> implements CacheProvider<T> {
  private store: RedisStore<CacheEntry<T>>

  constructor(private readonly props: CacheProps, private readonly context: RedisApplicationContext) {
    Preconditions.isNil(props.maxSize, 'RedisCacheProvider does not support the maxSize property.')
    Preconditions.isPresent(props.timeToLive, 'RedisCacheProvider requires the timeToLive property to be set.')

    this.store = new RedisStore({ namespace: RedisCacheProvider.Type as ResourceKey, timeToLive: props.timeToLive }, context)
  }

  type = RedisCacheProvider.Type

  fetchValue = async (key: CacheKey): Promise<CacheEntry<T> | undefined> => {
    const result = await this.store.fetchValue(key)
    if (Objects.isNil(result) || CacheEntry.isDead(result)) {
      return undefined
    }

    return result
  }

  writeValue = async (key: CacheKey, newEntry: CacheEntry<T> | undefined): Promise<void> => {
    if (Objects.isUndefined(newEntry)) {
      await this.store.writeValue(key, undefined)
    } else {
      const entry = CacheEntry.limit(newEntry, this.props)
      await this.store.writeValue(key, entry)
    }
  }

  // JOHN should this method be moved to RedisStore?
  evictAll = async (section: CacheSection): Promise<void> => {
    const client = Redis.getClient(this.context)
    const keyPrefix = this.store.getKeyString(section.prefix)

    // JOHN escape ' ?
    await client.eval(`for _,k in ipairs(redis.call('keys','${keyPrefix}*')) do redis.call('del',k) end`, 0)
  }
}
