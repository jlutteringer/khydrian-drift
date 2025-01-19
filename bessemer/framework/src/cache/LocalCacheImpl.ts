import { CacheEntry, CacheKey, LocalCache, LocalCacheProvider } from '@bessemer/cornerstone/cache'
import { Async, Objects } from '@bessemer/cornerstone'

export class LocalCacheImpl<T> implements LocalCache<T> {
  constructor(readonly name: string, private readonly providers: Array<LocalCacheProvider<T>>) {}

  getValue(initialKey: CacheKey, fetch: () => T): T {
    if (CacheKey.isDisabled(initialKey)) {
      return fetch()
    }

    const key: CacheKey = CacheKey.namespace(initialKey, this.name)
    const entry = this.getValidCachedValue(key)
    if (Objects.isPresent(entry)) {
      if (CacheEntry.isStale(entry)) {
        this.revalidate(key, fetch)
      }

      return entry.value
    }

    const fetchedValue = fetch()
    this.setValue(key, fetchedValue)
    return fetchedValue
  }

  setValue(initialKey: CacheKey, value: T | undefined): void {
    if (CacheKey.isDisabled(initialKey)) {
      return
    }

    const key: CacheKey = CacheKey.namespace(initialKey, this.name)
    const entry = value !== undefined ? CacheEntry.of(value) : undefined
    this.providers.forEach((provider) => provider.setValue(key, entry))
  }

  private getValidCachedValue(key: CacheKey, allowStale: boolean = true): CacheEntry<T> | undefined {
    for (const provider of this.providers) {
      const entry = provider.getValue(key)
      if (Objects.isPresent(entry)) {
        if (!CacheEntry.isStale(entry) || allowStale) {
          return entry
        }
      }
    }

    return undefined
  }

  // JOHN do we want to implement soft revalidates?
  private revalidate(key: CacheKey, fetch: () => T, hard: boolean = false): void {
    Async.execute(async () => {
      const fetchedValue = fetch()
      this.setValue(key, fetchedValue)
      return fetchedValue
    })
  }
}
