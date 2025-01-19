import { Cache, CacheEntry, CacheKey, CacheProvider, CacheSection } from '@bessemer/cornerstone/cache'
import { AdvisoryLocks, BessemerApplicationContext } from '@bessemer/framework'
import { Async, Objects } from '@bessemer/cornerstone'

const DistributedLockPrefix: CacheKey = 'DistributedCache'

export class CacheImpl<T> implements Cache<T> {
  constructor(readonly name: string, private readonly providers: Array<CacheProvider<T>>, private readonly context: BessemerApplicationContext) {}

  async fetchValue(initialKey: CacheKey, fetch: () => Promise<T>): Promise<T> {
    if (CacheKey.isDisabled(initialKey)) {
      return fetch()
    }

    const key: CacheKey = CacheKey.namespace(initialKey, this.name)

    const fetchedValue = AdvisoryLocks.usingOptimisticLock(
      CacheKey.namespace(initialKey, DistributedLockPrefix),
      this.context,
      async () => {
        const entry = await this.getValidCachedValue(key)
        if (Objects.isPresent(entry)) {
          if (CacheEntry.isStale(entry)) {
            this.revalidate(key, fetch)
          }

          return entry.value
        }
      },
      async () => {
        const fetchedValue = await fetch()
        await this.writeValueInternal(key, fetchedValue)
        return fetchedValue
      }
    )

    return fetchedValue
  }

  private async getValidCachedValue(key: CacheKey, allowStale: boolean = true): Promise<CacheEntry<T> | undefined> {
    const cacheMisses: Array<CacheProvider<T>> = []
    for (const provider of this.providers) {
      const entry = await provider.fetchValue(key)
      if (Objects.isPresent(entry)) {
        if (!CacheEntry.isStale(entry)) {
          // JOHN should there be minimums here?
          Async.execute(async () => {
            cacheMisses.forEach((it) => it.writeValue(key, entry))
          })

          return entry
        } else if (allowStale) {
          return entry
        }
      } else {
        cacheMisses.push(provider)
      }
    }

    return undefined
  }

  // JOHN do we want to implement soft revalidates?
  private async revalidate(key: CacheKey, fetch: () => Promise<T>, hard: boolean = false): Promise<T> {
    const fetchedValue = await AdvisoryLocks.usingLock(CacheKey.namespace(key, DistributedLockPrefix), this.context, async () => {
      const fetchedValue = await fetch()
      await this.writeValueInternal(key, fetchedValue)
      return fetchedValue
    })

    return fetchedValue
  }

  writeValue = async (initialKey: CacheKey, value: T | undefined): Promise<void> => {
    if (CacheKey.isDisabled(initialKey)) {
      return
    }

    const key = CacheKey.namespace(initialKey, this.name)
    return this.writeValueInternal(key, value)
  }

  private writeValueInternal = async (key: CacheKey, value: T | undefined): Promise<void> => {
    const entry = value !== undefined ? CacheEntry.of(value) : undefined
    await Promise.all(this.providers.map((provider) => provider.writeValue(key, entry)))
  }

  evictAll = async (initialSection: CacheSection): Promise<void> => {
    const section = CacheSection.namespace(initialSection, this.name)
    await Promise.all(this.providers.map((provider) => provider.evictAll(section)))
  }
}
