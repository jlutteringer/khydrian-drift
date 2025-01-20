import { Cache, CacheEntry, CacheKey, CacheProvider, CacheSection } from '@bessemer/cornerstone/cache'
import { AdvisoryLocks, BessemerApplicationContext } from '@bessemer/framework'
import { Arrays, Async, Entries } from '@bessemer/cornerstone'
import { ResourceKey, ResourceNamespace } from '@bessemer/cornerstone/resource'
import { Entry } from '@bessemer/cornerstone/entry'

export class CacheImpl<T> implements Cache<T> {
  // JOHN we really need to think through the implications of how we handle context here
  constructor(readonly name: string, private readonly providers: Array<CacheProvider<T>>, private readonly context: BessemerApplicationContext) {}

  fetchValue = async (namespace: ResourceNamespace, key: ResourceKey, fetch: () => Promise<T>): Promise<T> => {
    const results = await this.fetchValues(namespace, [key], async () => {
      return [Entries.of(key, await fetch())]
    })

    return Arrays.first(results)![1]
  }

  fetchValues = async (
    initialNamespace: ResourceNamespace,
    keys: Array<ResourceKey>,
    fetch: (keys: Array<ResourceKey>) => Promise<Array<Entry<T>>>
  ): Promise<Array<Entry<T>>> => {
    if (CacheKey.isDisabled(initialNamespace)) {
      return await fetch(keys)
    }

    const namespace = ResourceKey.extendNamespace(this.name, initialNamespace)
    const namespacedKeys = ResourceKey.namespaceAll(namespace, keys)

    const entries = await AdvisoryLocks.usingIncrementalLocks(
      namespacedKeys,
      this.context,
      async (keys) => {
        const entries = await this.getCachedValues(keys)
        return entries
      },
      async (keys) => {
        const fetchedValues = Entries.mapValues(await fetch(keys), CacheEntry.of)
        await this.writeValueInternal(fetchedValues)
        return fetchedValues
      }
    )

    this.revalidate(entries, fetch)

    const results = entries.map(([key, value]) => {
      return Entries.of(ResourceKey.stripNamespace(namespace, key), value.value)
    })

    return results
  }

  private async getCachedValues(namespacedKeys: Array<ResourceKey>, allowStale: boolean = true): Promise<Array<Entry<CacheEntry<T>>>> {
    let remainingKeys = namespacedKeys
    const results: Array<Entry<CacheEntry<T>>> = []

    for (const provider of this.providers) {
      if (Arrays.isEmpty(remainingKeys)) {
        break
      }

      const entries = (await provider.fetchValues(remainingKeys)).filter(([_, value]) => {
        return !CacheEntry.isStale(value) || allowStale
      })

      results.push(...entries)
      remainingKeys = remainingKeys.filter((it) => entries.find(([key, _]) => key === it))
    }

    return results
  }

  // JOHN do we want to implement soft revalidates?
  private revalidate(
    entries: Array<Entry<CacheEntry<T>>>,
    fetch: (keys: Array<ResourceKey>) => Promise<Array<Entry<T>>>,
    hard: boolean = false
  ): void {
    Async.execute(async () => {
      const staleKeys = Entries.keys(entries.filter(([_, value]) => CacheEntry.isStale(value)))

      await AdvisoryLocks.usingLock(staleKeys, this.context, async () => {
        const fetchedValues = Entries.mapValues(await fetch(staleKeys), CacheEntry.of)
        await this.writeValueInternal(fetchedValues)
      })
    })
  }

  writeValue = async (namespace: ResourceNamespace, key: ResourceKey, value: T | undefined): Promise<void> => {
    await this.writeValues(namespace, [Entries.of(key, value)])
  }

  writeValues = async (initialNamespace: ResourceNamespace, entries: Array<Entry<T | undefined>>): Promise<void> => {
    if (CacheKey.isDisabled(initialNamespace)) {
      return
    }

    const namespace = ResourceKey.extendNamespace(this.name, initialNamespace)
    const namespacedEntries = entries.map(([key, value]) => {
      return Entries.of(ResourceKey.namespace(namespace, key), value !== undefined ? CacheEntry.of(value) : undefined)
    })

    return this.writeValueInternal(namespacedEntries)
  }

  private writeValueInternal = async (entries: Array<Entry<CacheEntry<T> | undefined>>): Promise<void> => {
    await Promise.all(this.providers.map((provider) => provider.writeValues(entries)))
  }

  evictAll = async (initialSection: CacheSection): Promise<void> => {
    const section = CacheSection.namespace(initialSection, this.name)
    await Promise.all(this.providers.map((provider) => provider.evictAll(section)))
  }
}
