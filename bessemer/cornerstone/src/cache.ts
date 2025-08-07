import { AbstractLocalKeyValueStore, AbstractRemoteKeyValueStore, LocalKeyValueStore, RemoteKeyValueStore } from '@bessemer/cornerstone/store'
import { Duration, OneDay, OneHour, toMilliseconds } from '@bessemer/cornerstone/duration'
import { ResourceKey, ResourceNamespace } from '@bessemer/cornerstone/resource'
import { AbstractApplicationContext } from '@bessemer/cornerstone/context'
import { NominalType } from '@bessemer/cornerstone/types'
import { RecordEntry } from '@bessemer/cornerstone/entry'
import { GlobPattern } from '@bessemer/cornerstone/glob'
import { Arrayable } from 'type-fest'
import Zod, { ZodType } from 'zod/v4'
import { deepMerge, isNil } from '@bessemer/cornerstone/object'
import { contains } from '@bessemer/cornerstone/string'
import { toArray } from '@bessemer/cornerstone/array'
import { addMilliseconds, isBefore, now } from '@bessemer/cornerstone/date'

// JOHN should this even be in cornerstone? especially consider the config types down at the bottom

export type CacheProps = {
  maxSize: number | null
  timeToLive: Duration
  timeToStale: Duration | null
}

export type CacheOptions = Partial<CacheProps>

export namespace CacheProps {
  const DefaultCacheProps = {
    maxSize: 50000,
    timeToLive: OneDay,
    timeToStale: OneHour,
  }

  export const buildCacheProps = (options?: CacheOptions): CacheProps => {
    options = options ?? {}

    const props = deepMerge(DefaultCacheProps, options)

    if (props.maxSize === null && props.timeToLive === null) {
      throw new Error('Invalid cache configuration, both maxSize and timeToLive are null')
    }

    return props
  }
}

export namespace CacheKey {
  // We use a hardcoded UUID to represent a unique token value that serves as a flag to disable caching
  const DisableCacheToken = 'f6822c1a-d527-4c65-b9dd-ddc24620b684'

  export const disableCaching = (): ResourceNamespace => {
    return DisableCacheToken
  }

  export const isDisabled = (key: ResourceNamespace): boolean => {
    return contains(key, DisableCacheToken)
  }
}

export type CacheSector = {
  globs: Array<GlobPattern>
}

export namespace CacheSector {
  export const of = (globs: Arrayable<GlobPattern>) => {
    return { globs: toArray(globs) }
  }

  export const namespace = (namespace: ResourceNamespace, sector: CacheSector): CacheSector => {
    return { globs: ResourceKey.namespaceAll(namespace, sector.globs) }
  }
}

export type CacheName = NominalType<string, 'CacheName'>
export const CacheNameSchema: ZodType<CacheName> = Zod.string()

export interface AbstractCache<T> {
  name: CacheName
}

export interface Cache<T> extends AbstractCache<T> {
  fetchValue(namespace: ResourceNamespace, key: ResourceKey, fetch: () => Promise<T>): Promise<T>

  fetchValues(
    namespace: ResourceNamespace,
    keys: Array<ResourceKey>,
    fetch: (keys: Array<ResourceKey>) => Promise<Array<RecordEntry<T>>>
  ): Promise<Array<RecordEntry<T>>>

  writeValue(namespace: ResourceNamespace, key: ResourceKey, value: T | undefined): Promise<void>

  writeValues(namespace: ResourceNamespace, entries: Array<RecordEntry<T | undefined>>): Promise<void>

  evictAll(sector: CacheSector): Promise<void>
}

export interface CacheProvider<T> extends RemoteKeyValueStore<CacheEntry<T>> {
  type: CacheProviderType

  evictAll(sector: CacheSector): Promise<void>
}

export abstract class AbstractCacheProvider<T> extends AbstractRemoteKeyValueStore<CacheEntry<T>> implements CacheProvider<T> {
  abstract type: CacheProviderType

  abstract evictAll(sector: CacheSector): Promise<void>
}

export interface LocalCache<T> extends AbstractCache<T> {
  getValue(namespace: ResourceNamespace, key: ResourceKey, fetch: () => T): T

  getValues(namespace: ResourceNamespace, keys: Array<ResourceKey>, fetch: (keys: Array<ResourceKey>) => Array<RecordEntry<T>>): Array<RecordEntry<T>>

  setValue(namespace: ResourceNamespace, key: ResourceKey, value: T | undefined): void

  setValues(namespace: ResourceNamespace, entries: Array<RecordEntry<T | undefined>>): void

  removeAll(sector: CacheSector): void
}

export interface LocalCacheProvider<T> extends LocalKeyValueStore<CacheEntry<T>>, CacheProvider<T> {
  removeAll(sector: CacheSector): void
}

export abstract class AbstractLocalCacheProvider<T> extends AbstractLocalKeyValueStore<CacheEntry<T>> implements LocalCacheProvider<T> {
  abstract type: CacheProviderType

  abstract removeAll(sector: CacheSector): void

  async evictAll(sector: CacheSector): Promise<void> {
    this.removeAll(sector)
  }
}

export type CacheEntry<T> = {
  value: T
  liveTimestamp: Date | null
  staleTimestamp: Date | null
}

export namespace CacheEntry {
  export const isActive = <T>(entry: CacheEntry<T>): boolean => {
    if (isDead(entry) || isStale(entry)) {
      return false
    }

    return true
  }

  export const isDead = <T>(entry: CacheEntry<T> | undefined): boolean => {
    if (isNil(entry)) {
      return true
    }

    if (isNil(entry.liveTimestamp)) {
      return false
    }

    return isBefore(entry.liveTimestamp, now())
  }

  export const isAlive = <T>(entry: CacheEntry<T> | undefined): boolean => !isDead(entry)

  export const isStale = <T>(entry: CacheEntry<T>): boolean => {
    if (isNil(entry.staleTimestamp)) {
      return false
    }

    return isBefore(entry.staleTimestamp, now())
  }

  export const of = <T>(value: T) => {
    const entry: CacheEntry<T> = {
      value,
      liveTimestamp: null,
      staleTimestamp: null,
    }

    return entry
  }

  // JOHN do we want to enforce some kind of minimum liveness threshold?
  export const applyProps = <T>(originalEntry: CacheEntry<T>, props: CacheProps): CacheEntry<T> => {
    let liveTimestamp: Date | null = originalEntry.liveTimestamp
    if (!isNil(props.timeToLive)) {
      const limit = addMilliseconds(now(), toMilliseconds(props.timeToLive))
      if (isBefore(limit, liveTimestamp ?? limit)) {
        liveTimestamp = limit
      }
    }

    let staleTimestamp: Date | null = originalEntry.staleTimestamp
    if (!isNil(props.timeToStale)) {
      const limit = addMilliseconds(now(), toMilliseconds(props.timeToStale))
      if (isBefore(limit, staleTimestamp ?? limit)) {
        staleTimestamp = limit
      }
    }

    const limitedEntry: CacheEntry<T> = {
      value: originalEntry.value,
      liveTimestamp,
      staleTimestamp,
    }

    return limitedEntry
  }
}

export type CacheConfigurationOptions = CacheConfigurationSection & {
  local: CacheConfigurationSection
}

export type CacheConfigurationSection = {
  defaults: CacheDefinition

  /**
   * These options map from cache name key to configuration. They are a way for the tenant to override the configurations
   * for specific caches from the cache configuration here.
   */
  caches?: Record<string, Partial<CacheDefinition>>
}

export type CacheDefinition = {
  options?: CacheOptions
  providers: Array<CacheProviderConfiguration>
}

export type CacheProviderType = NominalType<string, 'CacheProviderType'>
export type CacheProviderConfiguration = CacheOptions & {
  type: CacheProviderType
}

export type CacheConfiguration = CacheConfigurationSection & {
  local: CacheConfigurationSection
}

export type CacheProviderRegistry<ContextType extends AbstractApplicationContext> = {
  type: CacheProviderType
  construct: <T>(props: CacheProps, context: ContextType) => CacheProvider<T>
}
