import { CacheEntry, CacheProps, CacheProvider, CacheProviderRegistry, CacheProviderType, CacheSection } from '@bessemer/cornerstone/cache'
import { Entries, Objects, Preconditions } from '@bessemer/cornerstone'
import { RedisApplicationContext } from '@bessemer/redis/application'
import { RedisStore } from '@bessemer/redis/store/RedisStore'
import { ResourceKey, ResourceNamespace } from '@bessemer/cornerstone/resource'
import { Entry } from '@bessemer/cornerstone/entry'

export namespace RedisCacheProvider {
  export const Type: CacheProviderType = 'RedisCacheProvider'

  export const register = (): CacheProviderRegistry<RedisApplicationContext> => {
    return {
      type: Type,
      construct: (props: CacheProps, context: RedisApplicationContext) => {
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

    this.store = new RedisStore({ namespace: RedisCacheProvider.Type as ResourceNamespace, timeToLive: props.timeToLive }, context)
  }

  type = RedisCacheProvider.Type

  fetchValues = async (keys: Array<ResourceKey>): Promise<Array<Entry<CacheEntry<T>>>> => {
    const results = await this.store.fetchValues(keys)
    return results.filter(([_, value]) => CacheEntry.isAlive(value))
  }

  writeValues = async (entries: Array<Entry<CacheEntry<T> | undefined>>): Promise<void> => {
    const limitedEntries = Entries.mapValues(entries, (it) => (Objects.isUndefined(it) ? it : CacheEntry.limit(it, this.props)))
    await this.store.writeValues(limitedEntries)
  }

  // JOHN implement me
  // JOHN should this method be moved to RedisStore?
  evictAll = async (section: CacheSection): Promise<void> => {
    // const client = Redis.getClient(this.context)
    // const keyPrefix = this.store.getKeyString(section.prefix)
    //
    // // JOHN escape ' ?
    // await client.eval(`for _,k in ipairs(redis.call('keys','${keyPrefix}*')) do redis.call('del',k) end`, 0)
  }
}
