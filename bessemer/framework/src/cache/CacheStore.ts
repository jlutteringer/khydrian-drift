import { LocalKeyValueStore } from '@bessemer/cornerstone/store'
import { Cache, LocalCache } from '@bessemer/cornerstone/cache'
import { Stores } from '@bessemer/cornerstone'

export class CacheStore {
  caches: LocalKeyValueStore<Cache<unknown>> = Stores.fromMap()
  localCaches: LocalKeyValueStore<LocalCache<unknown>> = Stores.fromMap()
}
