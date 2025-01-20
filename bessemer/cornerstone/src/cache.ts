import { AbstractLocalKeyValueStore, LocalKeyValueStore, RemoteKeyValueStore } from '@bessemer/cornerstone/store'
import { Dates, Durations, Objects, Strings } from '@bessemer/cornerstone'
import { Duration } from '@bessemer/cornerstone/duration'
import { ResourceKey, ResourceNamespace } from '@bessemer/cornerstone/resource'
import { AbstractApplicationContext } from '@bessemer/cornerstone/context'
import { NominalType } from '@bessemer/cornerstone/types'
import { Entry } from '@bessemer/cornerstone/entry'

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
    timeToLive: Durations.OneDay,
    timeToStale: Durations.OneHour,
  }

  export const buildCacheProps = (options?: CacheOptions): CacheProps => {
    options = options ?? {}

    const props = Objects.merge(options, DefaultCacheProps)

    if (props.maxSize === null && props.timeToLive === null) {
      throw new Error('Invalid cache configuration, both maxSize and timeToLive are null')
    }
    ;``

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
    return Strings.contains(key, DisableCacheToken)
  }
}

// JOHN reconsider this whole API
export type CacheSection = {
  prefix: ResourceKey
}

export namespace CacheSection {
  export const of = (prefix: ResourceKey) => {
    return { prefix }
  }

  export const namespace = (section: CacheSection, namespace: string): CacheSection => {
    return of(ResourceKey.namespace(section.prefix, namespace))
  }
}

export interface Cache<T> {
  name: string

  fetchValue(namespace: ResourceNamespace, key: ResourceKey, fetch: () => Promise<T>): Promise<T>

  fetchValues(
    namespace: ResourceNamespace,
    keys: Array<ResourceKey>,
    fetch: (keys: Array<ResourceKey>) => Promise<Array<Entry<T>>>
  ): Promise<Array<Entry<T>>>

  writeValue(namespace: ResourceNamespace, key: ResourceKey, value: T | undefined): Promise<void>

  writeValues(namespace: ResourceNamespace, entries: Array<Entry<T | undefined>>): Promise<void>

  // JOHN reconsider api
  evictAll(section: CacheSection): Promise<void>
}

export interface CacheProvider<T> extends RemoteKeyValueStore<CacheEntry<T>> {
  type: CacheProviderType

  evictAll(section: CacheSection): Promise<void>
}

export interface LocalCache<T> {
  name: string

  getValue(namespace: ResourceNamespace, key: ResourceKey, fetch: () => T): T

  getValues(namespace: ResourceNamespace, keys: Array<ResourceKey>, fetch: (keys: Array<ResourceKey>) => Array<Entry<T>>): Array<Entry<T>>

  setValue(namespace: ResourceNamespace, key: ResourceKey, value: T | undefined): void

  setValues(namespace: ResourceNamespace, entries: Array<Entry<T | undefined>>): void
}

export interface LocalCacheProvider<T> extends LocalKeyValueStore<CacheEntry<T>>, CacheProvider<T> {
  removeAll(section: CacheSection): void
}

export abstract class AbstractLocalCacheProvider<T> extends AbstractLocalKeyValueStore<CacheEntry<T>> implements LocalCacheProvider<T> {
  abstract type: CacheProviderType

  abstract removeAll(section: CacheSection): void

  async evictAll(section: CacheSection): Promise<void> {
    this.removeAll(section)
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
    if (Objects.isNil(entry)) {
      return true
    }

    if (Objects.isNil(entry.liveTimestamp)) {
      return false
    }

    return Dates.isBefore(entry.liveTimestamp, Dates.now())
  }

  export const isAlive = <T>(entry: CacheEntry<T> | undefined): boolean => !isDead(entry)

  export const isStale = <T>(entry: CacheEntry<T>): boolean => {
    if (Objects.isNil(entry.staleTimestamp)) {
      return false
    }

    return Dates.isBefore(entry.staleTimestamp, Dates.now())
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
  export const limit = <T>(originalEntry: CacheEntry<T>, props: CacheProps): CacheEntry<T> => {
    let liveTimestamp: Date | null = originalEntry.liveTimestamp
    if (!Objects.isNil(props.timeToLive)) {
      const limit = Dates.addMilliseconds(Dates.now(), Durations.inMilliseconds(props.timeToLive))
      if (Dates.isBefore(limit, liveTimestamp ?? limit)) {
        liveTimestamp = limit
      }
    }

    let staleTimestamp: Date | null = originalEntry.staleTimestamp
    if (!Objects.isNil(props.timeToStale)) {
      const limit = Dates.addMilliseconds(Dates.now(), Durations.inMilliseconds(props.timeToStale))
      if (Dates.isBefore(limit, staleTimestamp ?? limit)) {
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
  constructor: <T>(props: CacheProps, context: ContextType) => CacheProvider<T>
}

export type CacheContext = {
  providers: Array<CacheProviderRegistry<any>>
  configuration: CacheConfiguration
}
