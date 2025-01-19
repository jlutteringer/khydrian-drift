import {
  AbstractLocalCacheProvider,
  CacheEntry,
  CacheKey,
  CacheProps,
  CacheProviderRegistry,
  CacheProviderType,
  CacheSection,
} from '@bessemer/cornerstone/cache'
import { LRUCache } from 'lru-cache'
import { Durations, Objects } from '@bessemer/cornerstone'
import { BessemerApplicationContext } from '@bessemer/framework'

export namespace MemoryCacheProvider {
  export const Type: CacheProviderType = 'MemoryCacheProvider'

  export const register = (): CacheProviderRegistry<BessemerApplicationContext> => {
    return {
      type: Type,
      constructor: (props: CacheProps) => new MemoryCacheProviderImpl(props),
    }
  }
}

export class MemoryCacheProviderImpl<T> extends AbstractLocalCacheProvider<T> {
  cache: LRUCache<string, any>

  constructor(readonly props: CacheProps) {
    super()

    // JOHN check null coercion here
    this.cache = new LRUCache({
      max: props.maxSize!,
      ttl: Durations.inMilliseconds(props.timeToLive!),
      allowStale: false,
    })
  }

  type = MemoryCacheProvider.Type

  getValue = (key: CacheKey): CacheEntry<T> | undefined => {
    const entry: CacheEntry<T> | undefined = this.cache.get(key)
    if (CacheEntry.isDead(entry)) {
      return undefined
    }

    return entry
  }

  setValue = (key: CacheKey, entry: CacheEntry<T> | undefined): void => {
    if (entry === undefined) {
      this.cache.delete(key)
      return
    }

    this.cache.set(key, CacheEntry.limit(entry, this.props))
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
