import { AbstractCache, CacheEntry, CacheProvider, CacheSector } from '@bessemer/cornerstone/cache'
import { AdvisoryLocks, BessemerApplicationContext, GlobalContextType } from '@bessemer/framework'
import { Arrays, Async, Entries, Loggers, ResourceKeys } from '@bessemer/cornerstone'
import { ResourceKey, ResourceNamespace } from '@bessemer/cornerstone/resource-key'
import { RecordEntry } from '@bessemer/cornerstone/entry'

const logger = Loggers.child('CacheImpl')

export class CacheImpl<T> extends AbstractCache<T> {
  constructor(
    readonly name: string,
    private readonly providers: Array<CacheProvider<T>>,
    private readonly context: GlobalContextType<BessemerApplicationContext>
  ) {
    super()
  }

  private getNamespace = (): ResourceNamespace => {
    return ResourceKeys.namespace(this.name)
  }

  fetchValues = async (
    keys: Array<ResourceKey>,
    fetch: (keys: Array<ResourceKey>) => Promise<Array<RecordEntry<T>>>
  ): Promise<Array<RecordEntry<T>>> => {
    logger.trace(() => `Fetching cache values: ${JSON.stringify(keys)} under namespace: [${this.name}]`)

    const namespacedKeys = ResourceKeys.applyNamespaceAll(this.getNamespace(), keys)

    const entries = await AdvisoryLocks.usingIncrementalLocks(
      namespacedKeys,
      this.context,
      async (namespacedKeys) => {
        const entries = await this.getCachedValues(namespacedKeys)
        return entries
      },
      async (namespacedKeys) => {
        const keys = ResourceKeys.stripNamespaceAll(this.getNamespace(), namespacedKeys)
        logger.trace(() => `Cache Miss! Retrieving from source: ${JSON.stringify(keys)} under namespace: [${this.name}]`)

        const fetchedValues = (await fetch(keys)).map(([key, value]) =>
          Entries.of(ResourceKeys.applyNamespace(this.getNamespace(), key), CacheEntry.of(value))
        )
        await this.writeValueInternal(fetchedValues)
        return fetchedValues
      }
    )

    this.revalidate(entries, fetch)

    const results = entries.map(([key, value]) => {
      return Entries.of(ResourceKeys.stripNamespace(this.getNamespace(), key), value.value)
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

  private revalidate(entries: Array<RecordEntry<CacheEntry<T>>>, fetch: (keys: Array<ResourceKey>) => Promise<Array<RecordEntry<T>>>): void {
    Async.execute(async () => {
      const staleKeys = Entries.keys(entries.filter(([_, value]) => CacheEntry.isStale(value)))
      if (Arrays.isEmpty(staleKeys)) {
        return
      }

      await AdvisoryLocks.usingLock(staleKeys, this.context, async () => {
        const keys = ResourceKeys.stripNamespaceAll(this.getNamespace(), staleKeys)
        const fetchedValues = (await fetch(keys)).map(([key, value]) =>
          Entries.of(ResourceKeys.applyNamespace(this.getNamespace(), key), CacheEntry.of(value))
        )
        await this.writeValueInternal(fetchedValues)
      })
    })
  }

  writeValues = async (entries: Array<RecordEntry<T | undefined>>): Promise<void> => {
    const namespacedEntries = entries.map(([key, value]) => {
      return Entries.of(ResourceKeys.applyNamespace(this.getNamespace(), key), value !== undefined ? CacheEntry.of(value) : undefined)
    })

    return this.writeValueInternal(namespacedEntries)
  }

  private writeValueInternal = async (entries: Array<RecordEntry<CacheEntry<T> | undefined>>): Promise<void> => {
    await Promise.all(this.providers.map((provider) => provider.writeValues(entries)))
  }

  evictAll = async (initialSector: CacheSector): Promise<void> => {
    const sector = CacheSector.namespace(this.getNamespace(), initialSector)
    await Promise.all(this.providers.map((provider) => provider.evictAll(sector)))
  }
}
