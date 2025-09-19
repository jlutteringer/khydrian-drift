import {
  AbstractLocalCacheProvider,
  CacheEntry,
  CacheProps,
  CacheProviderRegistry,
  CacheProviderType,
  CacheSector,
} from '@bessemer/cornerstone/cache'
import { LRUCache } from 'lru-cache'
import { Durations, Entries, Globs, Loggers, Objects } from '@bessemer/cornerstone'
import { BessemerApplicationContext } from '@bessemer/framework'
import { ResourceKey } from '@bessemer/cornerstone/resource-key'
import { RecordEntry } from '@bessemer/cornerstone/entry'

const logger = Loggers.child('MemoryCacheProvider')

export namespace MemoryCacheProvider {
  export const Type: CacheProviderType = 'MemoryCacheProvider'

  export const register = (): CacheProviderRegistry<BessemerApplicationContext> => {
    return {
      type: Type,
      construct: (props: CacheProps) => {
        return new MemoryCacheProviderImpl(props)
      },
    }
  }
}

export class MemoryCacheProviderImpl<T> extends AbstractLocalCacheProvider<T> {
  cache: LRUCache<string, any>

  constructor(readonly props: CacheProps) {
    super()

    if (Objects.isNil(props.maxSize)) {
      this.cache = new LRUCache({
        ttl: Durations.toMilliseconds(props.timeToLive),
        ttlAutopurge: true,
        allowStale: false,
      })
    } else {
      this.cache = new LRUCache({
        max: props.maxSize,
        ttl: Durations.toMilliseconds(props.timeToLive),
        allowStale: false,
      })
    }
  }

  type = MemoryCacheProvider.Type

  getValues = (keys: Array<ResourceKey>): Array<RecordEntry<CacheEntry<T>>> => {
    logger.trace(() => `Fetching cache values: ${JSON.stringify(keys)}`)

    const results = keys
      .map((it) => Entries.of(it, this.cache.get(it) as CacheEntry<T> | undefined))
      .filter(([_, value]) => Objects.isPresent(value))
      .filter(([_, value]) => CacheEntry.isAlive(value)) as Array<RecordEntry<CacheEntry<T>>>

    logger.trace(() => `Cache hit on: ${JSON.stringify(Entries.keys(results))}`)
    return results
  }

  getEntries = (): Array<RecordEntry<CacheEntry<T>>> => {
    return Array.of(...this.cache.entries())
  }

  setValues = (entries: Array<RecordEntry<CacheEntry<T> | undefined>>): void => {
    logger.trace(() => `Writing cache values: ${JSON.stringify(Entries.keys(entries))}`)

    entries.forEach(([key, value]) => {
      if (Objects.isUndefined(value)) {
        this.cache.delete(key)
      } else {
        this.cache.set(key, CacheEntry.applyProps(value, this.props))
      }
    })
  }

  removeAll = async (section: CacheSector): Promise<void> => {
    const iterator = this.cache.keys()
    let iterable: IteratorResult<string | void>
    do {
      iterable = iterator.next()
      const value = iterable.value

      if (Objects.isPresent(value) && Globs.anyMatch(value, section.globs)) {
        this.cache.delete(value)
      }
    } while (!iterable.done)
  }
}
