import {
  AbstractLocalCacheProvider,
  CacheEntry,
  CacheProps,
  CacheProviderRegistry,
  CacheProviderType,
  CacheSection,
} from '@bessemer/cornerstone/cache'
import { LRUCache } from 'lru-cache'
import { Durations, Entries, Loggers, Objects } from '@bessemer/cornerstone'
import { BessemerApplicationContext } from '@bessemer/framework'
import { ResourceKey } from '@bessemer/cornerstone/resource'
import { Entry } from '@bessemer/cornerstone/entry'

// JOHN this logger doesn't work... indicating a flaw in our proxy :(
// JOHN and the logs come out of order :( :(
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
        ttl: Durations.inMilliseconds(props.timeToLive),
        ttlAutopurge: true,
        allowStale: false,
      })
    } else {
      this.cache = new LRUCache({
        max: props.maxSize,
        ttl: Durations.inMilliseconds(props.timeToLive),
        allowStale: false,
      })
    }
  }

  type = MemoryCacheProvider.Type

  getValues = (keys: Array<ResourceKey>): Array<Entry<CacheEntry<T>>> => {
    logger.info(() => `Fetching cache values: ${JSON.stringify(keys)}`)

    const results = keys
      .map((it) => Entries.of(it, this.cache.get(it) as CacheEntry<T> | undefined))
      .filter(([_, value]) => Objects.isPresent(value))
      .filter(([_, value]) => CacheEntry.isAlive(value)) as Array<Entry<CacheEntry<T>>>

    logger.info(() => `Cache hit on: ${JSON.stringify(Entries.keys(results))}`)
    return results
  }

  setValues = (entries: Array<Entry<CacheEntry<T> | undefined>>): void => {
    logger.info(() => `Writing cache values: ${JSON.stringify(Entries.keys(entries))}`)

    entries.forEach(([key, value]) => {
      if (Objects.isUndefined(value)) {
        this.cache.delete(key)
      } else {
        this.cache.set(key, CacheEntry.applyProps(value, this.props))
      }
    })
  }

  // JOHN this implementation doesn't actually reference the section????
  removeAll = async (section: CacheSection): Promise<void> => {
    const iterator = this.cache.keys()
    let iterable: IteratorResult<string | void>
    do {
      iterable = iterator.next()
      const value = iterable.value
      if (!Objects.isNil(value)) {
        this.cache.delete(value)
      }
    } while (!iterable.done)
  }
}
