import { LocalKeyValueStore } from '@bessemer/cornerstone/store'
import { AsyncCache, LocalCache } from '@bessemer/cornerstone/cache'
import { Stores } from '@bessemer/cornerstone'

export class CacheStore {
  caches: LocalKeyValueStore<AsyncCache<unknown>> = Stores.fromMap()
  localCaches: LocalKeyValueStore<LocalCache<unknown>> = Stores.fromMap()
}
