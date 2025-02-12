import { CacheName } from '@bessemer/cornerstone/cache'
import { ResourceKey, ResourceNamespace } from '@bessemer/cornerstone/resource'
import { Arrayable } from 'type-fest'
import { Entry } from '@bessemer/cornerstone/entry'
import { GlobPattern } from '@bessemer/cornerstone/glob'

export type CacheClientContext = {}

export type CacheSummary = {
  name: CacheName
}

export type CacheDetail = CacheSummary & {
  detail: string
}

export type CacheTarget = Arrayable<GlobPattern>
export type CacheSectorTarget = Arrayable<GlobPattern>

export type CacheWriteRequest = {
  caches: CacheTarget

  namespace: ResourceNamespace
  values: Arrayable<Entry<unknown>>
}

export type CacheEvictRequest = {
  caches: CacheTarget
  sectors?: CacheSectorTarget

  namespace?: ResourceNamespace
  keys?: Arrayable<ResourceKey>
}
