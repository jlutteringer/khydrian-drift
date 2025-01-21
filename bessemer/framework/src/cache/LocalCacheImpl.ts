import { CacheEntry, CacheKey, LocalCache, LocalCacheProvider } from '@bessemer/cornerstone/cache'
import { Arrays, Async, Entries } from '@bessemer/cornerstone'
import { ResourceKey, ResourceNamespace } from '@bessemer/cornerstone/resource'
import { Entry } from '@bessemer/cornerstone/entry'

export class LocalCacheImpl<T> implements LocalCache<T> {
  constructor(readonly name: string, private readonly providers: Array<LocalCacheProvider<T>>) {}

  getValue = (namespace: ResourceNamespace, key: ResourceKey, fetch: () => T): T => {
    const results = this.getValues(namespace, [key], () => {
      return [Entries.of(key, fetch())]
    })

    return Arrays.first(results)![1]
  }

  getValues = (
    initialNamespace: ResourceNamespace,
    keys: Array<ResourceKey>,
    fetch: (keys: Array<ResourceKey>) => Array<Entry<T>>
  ): Array<Entry<T>> => {
    if (CacheKey.isDisabled(initialNamespace)) {
      return fetch(keys)
    }

    const namespace = ResourceKey.extendNamespace(this.name, initialNamespace)
    const namespacedKeys = ResourceKey.namespaceAll(namespace, keys)
    const entries = this.getCachedValues(namespacedKeys)
    this.revalidate(namespace, entries, fetch)

    const remainingKeys = namespacedKeys.filter((it) => !entries.find(([key, _]) => key === it))
    const fetchedValues = Entries.mapKeys(fetch(remainingKeys), (it) => ResourceKey.stripNamespace(namespace, it))
    this.setValues(initialNamespace, fetchedValues)

    const results = [...entries.map(([key, value]) => Entries.of(ResourceKey.stripNamespace(namespace, key), value.value)), ...fetchedValues]
    return results
  }

  setValue = (namespace: ResourceNamespace, key: ResourceKey, value: T | undefined): void => {
    this.setValues(namespace, [Entries.of(key, value)])
  }

  setValues = (initialNamespace: ResourceNamespace, entries: Array<Entry<T | undefined>>): void => {
    if (CacheKey.isDisabled(initialNamespace)) {
      return
    }

    const namespace = ResourceKey.extendNamespace(this.name, initialNamespace)
    const namespacedEntries = entries.map(([key, value]) => {
      return Entries.of(ResourceKey.namespace(namespace, key), value !== undefined ? CacheEntry.of(value) : undefined)
    })

    this.providers.forEach((provider) => provider.setValues(namespacedEntries))
  }

  private getCachedValues(namespacedKeys: Array<ResourceKey>, allowStale: boolean = true): Array<Entry<CacheEntry<T>>> {
    let remainingKeys = namespacedKeys
    const results: Array<Entry<CacheEntry<T>>> = []

    const providerMisses = new Map<LocalCacheProvider<T>, Array<Entry<CacheEntry<T>>>>()

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

  // JOHN do we want to implement soft revalidates?
  private revalidate(
    namespace: ResourceNamespace,
    entries: Array<Entry<CacheEntry<T>>>,
    fetch: (keys: Array<ResourceKey>) => Array<Entry<T>>,
    hard: boolean = false
  ): void {
    Async.execute(async () => {
      const staleKeys = Entries.keys(entries.filter(([_, value]) => CacheEntry.isStale(value)))
      const fetchedValues = Entries.mapKeys(fetch(staleKeys), (it) => ResourceKey.stripNamespace(namespace, it))
      this.setValues(namespace, fetchedValues)
    })
  }
}
