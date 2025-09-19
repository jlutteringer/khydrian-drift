import { AbstractCache, CacheName, CacheSector } from '@bessemer/cornerstone/cache'
import { Arrays, Entries, Globs, Objects, ResourceKeys } from '@bessemer/cornerstone'
import { Caches, GlobalContextType } from '@bessemer/framework'
import { AbstractApplicationContext } from '@bessemer/cornerstone/context'
import { CacheDetail, CacheEvictRequest, CacheSummary, CacheTarget, CacheWriteRequest } from '@bessemer/client/cache/types'

export interface CacheManager<ContextType extends AbstractApplicationContext = AbstractApplicationContext> {
  initialize: (context: GlobalContextType<ContextType>) => void

  writeValues: (request: CacheWriteRequest, context: GlobalContextType<ContextType>) => Promise<void>

  evictValues: (request: CacheEvictRequest, context: GlobalContextType<ContextType>) => Promise<void>

  getCaches: (context: GlobalContextType<ContextType>) => Promise<Array<CacheSummary>>

  getCacheDetails: (name: CacheName, context: GlobalContextType<ContextType>) => Promise<CacheDetail | null>
}

export class LocalCacheManager implements CacheManager {
  initialize = () => {
    // Do nothing
  }

  writeValues = async (request: CacheWriteRequest): Promise<void> => {
    const applicableCaches = this.filterForTarget(Entries.values(Caches.getStore().caches.getEntries()), request.caches)

    await Promise.all(
      applicableCaches.map((cache) => {
        const values = Arrays.toArray(request.values).map(([key, value]) => Entries.of(ResourceKeys.applyNamespace(request.namespace, key), value))
        return cache.writeValues(values)
      })
    )
  }

  evictValues = async (request: CacheEvictRequest): Promise<void> => {
    const applicableCaches = this.filterForTarget(Entries.values(Caches.getStore().caches.getEntries()), request.caches)

    await Promise.all(
      applicableCaches.map(async (cache) => {
        if (Objects.isPresent(request.sectors)) {
          await cache.evictAll(CacheSector.of(request.sectors))
        }

        if (Objects.isPresent(request.keys) && Objects.isPresent(request.namespace)) {
          const keys = Arrays.toArray(request.keys)
          await cache.writeValues(
            keys.map((it) => Entries.of(Objects.isPresent(request.namespace) ? ResourceKeys.applyNamespace(request.namespace, it) : it, undefined))
          )
        }
      })
    )
  }

  getCaches = async (): Promise<Array<CacheSummary>> => {
    const summaries = Entries.values(Caches.getStore().caches.getEntries()).map((cache) => {
      const summary: CacheSummary = {
        name: cache.name,
      }

      return summary
    })

    return summaries
  }

  getCacheDetails = async (name: CacheName): Promise<CacheDetail | null> => {
    return null
  }

  private filterForTarget = <T extends AbstractCache<unknown>>(caches: Array<T>, cacheTarget: CacheTarget): Array<T> => {
    return caches.filter((cache) => {
      const targets = Arrays.toArray(cacheTarget)

      return targets.some((target) => {
        return Globs.match(cache.name, target)
      })
    })
  }
}
