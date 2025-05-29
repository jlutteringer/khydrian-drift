import { AbstractCacheProvider, CacheEntry, CacheProps, CacheProviderRegistry, CacheProviderType, CacheSector } from '@bessemer/cornerstone/cache'
import { Assertions, Entries, Loggers, Objects } from '@bessemer/cornerstone'
import { RedisApplicationContext } from '@bessemer/redis/application'
import { RedisKeyValueStore } from '@bessemer/redis/store/RedisKeyValueStore'
import { ResourceKey, ResourceNamespace } from '@bessemer/cornerstone/resource'
import { Entry } from '@bessemer/cornerstone/entry'
import { GlobalContextType } from '@bessemer/framework'

const logger = Loggers.child('RedisCacheProvider')

export namespace RedisCacheProvider {
  export const Type: CacheProviderType = 'RedisCacheProvider'

  export const register = (): CacheProviderRegistry<RedisApplicationContext> => {
    return {
      type: Type,
      construct: (props: CacheProps, context: GlobalContextType<RedisApplicationContext>) => {
        return new RedisCacheProviderImpl(props, context)
      },
    }
  }
}

export class RedisCacheProviderImpl<T> extends AbstractCacheProvider<T> {
  private store: RedisKeyValueStore<CacheEntry<T>>

  constructor(private readonly props: CacheProps, context: GlobalContextType<RedisApplicationContext>) {
    super()

    Assertions.assertNil(props.maxSize, () => 'RedisCacheProvider does not support the maxSize property.')
    Assertions.assertPresent(props.timeToLive, () => 'RedisCacheProvider requires the timeToLive property to be set.')

    this.store = new RedisKeyValueStore({ namespace: RedisCacheProvider.Type as ResourceNamespace, timeToLive: props.timeToLive }, context)
  }

  type = RedisCacheProvider.Type

  fetchValues = async (keys: Array<ResourceKey>): Promise<Array<Entry<CacheEntry<T>>>> => {
    logger.trace(() => `Fetching cache values: ${JSON.stringify(keys)}`)
    const initialResults = await this.store.fetchValues(keys)
    const results = initialResults.filter(([_, value]) => CacheEntry.isAlive(value))

    logger.trace(() => `Cache hit on: ${JSON.stringify(Entries.keys(results))}`)
    return results
  }

  writeValues = async (entries: Array<Entry<CacheEntry<T> | undefined>>): Promise<void> => {
    logger.trace(() => `Writing cache values: ${JSON.stringify(Entries.keys(entries))}`)
    const hydratedEntries = Entries.mapValues(entries, (it) => (Objects.isUndefined(it) ? it : CacheEntry.applyProps(it, this.props)))
    await this.store.writeValues(hydratedEntries)
  }

  evictAll = async (sector: CacheSector): Promise<void> => {
    logger.trace(() => `Evicting cache sector: ${JSON.stringify(sector)}`)
    await this.store.evictAll(sector.globs)
  }
}
