import { CacheEntry, CacheSector, LocalCache, LocalCacheProvider } from '@bessemer/cornerstone/cache'
import { Arrays, Async, Entries, ResourceKeys } from '@bessemer/cornerstone'
import { NamespacedKey, ResourceKey, ResourceNamespace } from '@bessemer/cornerstone/resource-key'
import { RecordEntry } from '@bessemer/cornerstone/entry'

export class LocalCacheImpl<T> implements LocalCache<T> {
  constructor(readonly name: string, private readonly providers: Array<LocalCacheProvider<T>>) {}

  private getNamespace = (): ResourceNamespace => {
    return ResourceKeys.namespace(this.name)
  }

  getValue = (key: ResourceKey, fetch: () => T): T => {
    const results = this.getValues([key], () => {
      return [Entries.of(key, fetch())]
    })

    return Arrays.first(results)![1]
  }

  getValues = (keys: Array<ResourceKey>, fetch: (keys: Array<ResourceKey>) => Array<RecordEntry<T>>): Array<RecordEntry<T>> => {
    // FUTURE
    // if (CacheKey.isDisabled(initialNamespace)) {
    //   return fetch(keys)
    // }

    const namespacedKeys = ResourceKeys.applyNamespaceAll(keys, this.getNamespace())
    const entries = this.getCachedValues(namespacedKeys)
    this.revalidate(entries, fetch)

    const remainingKeys = namespacedKeys.filter((it) => !entries.find(([key, _]) => key === it))
    const fetchedValues = Entries.mapKeys(fetch(remainingKeys), (it) => ResourceKeys.getKey(it as NamespacedKey))
    this.setValues(fetchedValues)

    const results = [...entries.map(([key, value]) => Entries.of(ResourceKeys.getKey(key as NamespacedKey), value.value)), ...fetchedValues]
    return results
  }

  setValue = (key: ResourceKey, value: T | undefined): void => {
    this.setValues([Entries.of(key, value)])
  }

  setValues = (entries: Array<RecordEntry<T | undefined>>): void => {
    // FUTURE
    // if (CacheKey.isDisabled(initialNamespace)) {
    //   return
    // }

    const namespacedEntries = entries.map(([key, value]) => {
      return Entries.of(ResourceKeys.applyNamespace(key, this.getNamespace()), value !== undefined ? CacheEntry.of(value) : undefined)
    })

    this.providers.forEach((provider) => provider.setValues(namespacedEntries))
  }

  private getCachedValues(namespacedKeys: Array<ResourceKey>, allowStale: boolean = true): Array<RecordEntry<CacheEntry<T>>> {
    let remainingKeys = namespacedKeys
    const results: Array<RecordEntry<CacheEntry<T>>> = []

    const providerMisses = new Map<LocalCacheProvider<T>, Array<RecordEntry<CacheEntry<T>>>>()

    for (const provider of this.providers) {
      if (Arrays.isEmpty(remainingKeys)) {
        break
      }

      const entries = provider.getValues(remainingKeys).filter(([_, value]) => {
        return !CacheEntry.isStale(value) || allowStale
      })

      for (const misses of providerMisses.values()) {
        misses.push(...entries)
      }

      results.push(...entries)
      remainingKeys = remainingKeys.filter((it) => !entries.find(([key, _]) => key === it))

      providerMisses.set(provider, [])
    }

    for (const [provider, misses] of providerMisses.entries()) {
      if (!Arrays.isEmpty(misses)) {
        provider.setValues(misses)
      }
    }

    return results
  }

  private revalidate(entries: Array<RecordEntry<CacheEntry<T>>>, fetch: (keys: Array<ResourceKey>) => Array<RecordEntry<T>>): void {
    Async.execute(async () => {
      const staleKeys = Entries.keys(entries.filter(([_, value]) => CacheEntry.isStale(value)))
      const fetchedValues = Entries.mapKeys(fetch(staleKeys), (it) => ResourceKeys.getKey(it as NamespacedKey))
      this.setValues(fetchedValues)
    })
  }

  removeAll = (sector: CacheSector): void => {
    this.providers.map((provider) => provider.removeAll(sector))
  }
}
