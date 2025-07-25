import { Cache, CacheEntry, CacheKey, CacheProvider, CacheSector } from '@bessemer/cornerstone/cache'
import { AdvisoryLocks, BessemerApplicationContext, GlobalContextType } from '@bessemer/framework'
import { Arrays, Async, Entries, Loggers } from '@bessemer/cornerstone'
import { ResourceKey, ResourceNamespace } from '@bessemer/cornerstone/resource'
import { RecordEntry } from '@bessemer/cornerstone/entry'

const logger = Loggers.child('CacheImpl')

export class CacheImpl<T> implements Cache<T> {
  constructor(
    readonly name: string,
    private readonly providers: Array<CacheProvider<T>>,
    private readonly context: GlobalContextType<BessemerApplicationContext>
  ) {}

  fetchValue = async (namespace: ResourceNamespace, key: ResourceKey, fetch: () => Promise<T>): Promise<T> => {
    const results = await this.fetchValues(namespace, [key], async () => {
      return [Entries.of(key, await fetch())]
    })

    return Arrays.first(results)![1]
  }

  fetchValues = async (
    initialNamespace: ResourceNamespace,
    keys: Array<ResourceKey>,
    fetch: (keys: Array<ResourceKey>) => Promise<Array<RecordEntry<T>>>
  ): Promise<Array<RecordEntry<T>>> => {
    if (CacheKey.isDisabled(initialNamespace)) {
      return await fetch(keys)
    }

    const namespace = ResourceKey.extendNamespace(this.name, initialNamespace)
    logger.trace(() => `Fetching cache values: ${JSON.stringify(keys)} under namespace: [${namespace}]`)

    const namespacedKeys = ResourceKey.namespaceAll(namespace, keys)

    const entries = await AdvisoryLocks.usingIncrementalLocks(
      namespacedKeys,
      this.context,
      async (namespacedKeys) => {
        const entries = await this.getCachedValues(namespacedKeys)
        return entries
      },
      async (namespacedKeys) => {
        const keys = ResourceKey.stripNamespaceAll(namespace, namespacedKeys)
        logger.trace(() => `Cache Miss! Retrieving from source: ${JSON.stringify(keys)} under namespace: [${namespace}]`)

        const fetchedValues = (await fetch(keys)).map(([key, value]) => Entries.of(ResourceKey.namespace(namespace, key), CacheEntry.of(value)))
        await this.writeValueInternal(fetchedValues)
        return fetchedValues
      }
    )

    this.revalidate(namespace, entries, fetch)

    const results = entries.map(([key, value]) => {
      return Entries.of(ResourceKey.stripNamespace(namespace, key), value.value)
    })

    return results
  }

  private async getCachedValues(namespacedKeys: Array<ResourceKey>, allowStale: boolean = true): Promise<Array<RecordEntry<CacheEntry<T>>>> {
    let remainingKeys = namespacedKeys
    const results: Array<RecordEntry<CacheEntry<T>>> = []

    const providerMisses = new Map<CacheProvider<T>, Array<RecordEntry<CacheEntry<T>>>>()

    for (const provider of this.providers) {
      if (Arrays.isEmpty(remainingKeys)) {
        break
      }

      const entries = (await provider.fetchValues(remainingKeys)).filter(([_, value]) => {
        return !CacheEntry.isStale(value) || allowStale
      })

      for (const misses of providerMisses.values()) {
        misses.push(...entries)
      }

      results.push(...entries)
      remainingKeys = remainingKeys.filter((it) => !entries.find(([key, _]) => key === it))

      providerMisses.set(provider, [])
    }

    const writes = Array.from(providerMisses.entries())
      .filter(([_, misses]) => !Arrays.isEmpty(misses))
      .map(([provider, misses]) => provider.writeValues(misses))

    await Promise.all(writes)

    return results
  }

  private revalidate(
    namespace: ResourceNamespace,
    entries: Array<RecordEntry<CacheEntry<T>>>,
    fetch: (keys: Array<ResourceKey>) => Promise<Array<RecordEntry<T>>>
  ): void {
    Async.execute(async () => {
      const staleKeys = Entries.keys(entries.filter(([_, value]) => CacheEntry.isStale(value)))
      if (Arrays.isEmpty(staleKeys)) {
        return
      }

      await AdvisoryLocks.usingLock(staleKeys, this.context, async () => {
        const keys = ResourceKey.stripNamespaceAll(namespace, staleKeys)
        const fetchedValues = (await fetch(keys)).map(([key, value]) => Entries.of(ResourceKey.namespace(namespace, key), CacheEntry.of(value)))
        await this.writeValueInternal(fetchedValues)
      })
    })
  }

  writeValue = async (namespace: ResourceNamespace, key: ResourceKey, value: T | undefined): Promise<void> => {
    await this.writeValues(namespace, [Entries.of(key, value)])
  }

  writeValues = async (initialNamespace: ResourceNamespace, entries: Array<RecordEntry<T | undefined>>): Promise<void> => {
    if (CacheKey.isDisabled(initialNamespace)) {
      return
    }

    const namespace = ResourceKey.extendNamespace(this.name, initialNamespace)
    const namespacedEntries = entries.map(([key, value]) => {
      return Entries.of(ResourceKey.namespace(namespace, key), value !== undefined ? CacheEntry.of(value) : undefined)
    })

    return this.writeValueInternal(namespacedEntries)
  }

  private writeValueInternal = async (entries: Array<RecordEntry<CacheEntry<T> | undefined>>): Promise<void> => {
    await Promise.all(this.providers.map((provider) => provider.writeValues(entries)))
  }

  evictAll = async (initialSector: CacheSector): Promise<void> => {
    const sector = CacheSector.namespace(this.name, initialSector)
    await Promise.all(this.providers.map((provider) => provider.evictAll(sector)))
  }
}
