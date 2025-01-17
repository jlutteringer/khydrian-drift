import { AbstractLocalKeyValueStore, LocalKeyValueStore, RemoteKeyValueStore } from '@bessemer/cornerstone/store'
import { Dates, Durations, Objects, Strings } from '@bessemer/cornerstone'
import { Duration } from '@bessemer/cornerstone/duration'
import { ResourceKey } from '@bessemer/cornerstone/resource'

export type CacheKey = ResourceKey
export type CacheValue = NonNullable<unknown> | null

export type CacheProps = {
  maxSize: number | null
  timeToLive: Duration | null
  timeToStale: Duration | null
}

export namespace CacheKey {
  // We use a hardcoded UUID to represent a unique token value that serves as a flag to disable caching
  const DisableCacheToken = 'f6822c1a-d527-4c65-b9dd-ddc24620b684'

  export const disableCaching = (): CacheKey => {
    return DisableCacheToken
  }

  export const isDisabled = (key: CacheKey): boolean => {
    return Strings.contains(key, DisableCacheToken)
  }

  export const of = ResourceKey.of
  export const namespace = ResourceKey.namespace
}

export type CacheSection = {
  prefix: ResourceKey
}

export interface Cache<T extends CacheValue> {
  name: string

  fetchValue(key: CacheKey, fetch: () => Promise<T>): Promise<T>

  writeValue(key: CacheKey, value: T | undefined): Promise<void>

  evictAll(section: CacheSection): Promise<void>
}

export interface CacheProvider<T extends CacheValue> extends RemoteKeyValueStore<CacheEntry<T>> {
  type: string

  evictAll(section: CacheSection): Promise<void>
}

export interface LocalCache<T extends CacheValue> {
  name: string

  getValue(key: CacheKey, fetch: () => T): T

  setValue(key: CacheKey, value: T | undefined): void
}

export interface LocalCacheProvider<T extends CacheValue> extends LocalKeyValueStore<CacheEntry<T>>, CacheProvider<T> {
  removeAll(section: CacheSection): void
}

export abstract class AbstractLocalCacheProvider<T extends CacheValue>
  extends AbstractLocalKeyValueStore<CacheEntry<T>>
  implements LocalCacheProvider<T>
{
  abstract type: string

  abstract removeAll(section: CacheSection): void

  async evictAll(section: CacheSection): Promise<void> {
    this.removeAll(section)
  }
}

export type CacheEntry<T extends CacheValue> = {
  value: T
  liveTimestamp: Date | null
  staleTimestamp: Date | null
}

export namespace CacheEntry {
  export const isActive = <T extends CacheValue>(entry: CacheEntry<T>): boolean => {
    if (isDead(entry) || isStale(entry)) {
      return false
    }

    return true
  }

  export const isDead = <T extends CacheValue>(entry: CacheEntry<T> | undefined): boolean => {
    if (Objects.isNil(entry)) {
      return true
    }

    if (Objects.isNil(entry.liveTimestamp)) {
      return false
    }

    return Dates.isBefore(entry.liveTimestamp, Dates.now())
  }

  export const isStale = <T extends CacheValue>(entry: CacheEntry<T>): boolean => {
    if (Objects.isNil(entry.staleTimestamp)) {
      return false
    }

    return Dates.isBefore(entry.staleTimestamp, Dates.now())
  }

  export const of = <T extends CacheValue>(value: T) => {
    const entry: CacheEntry<T> = {
      value,
      liveTimestamp: null,
      staleTimestamp: null,
    }

    return entry
  }

  // JOHN do we want to enforce some kind of minimum liveness threshold?
  export const limit = <T extends CacheValue>(originalEntry: CacheEntry<T>, props: CacheProps): CacheEntry<T> => {
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

export namespace CacheProps {
  const DEFAULT_CACHE_PROPS = {
    maxSize: 50000,
    timeToLive: Durations.OneDay,
    timeToStale: Durations.OneHour,
  }

  export const buildCacheProps = (options?: CacheOptions): CacheProps => {
    options = options ?? {}

    const props = Objects.merge(options, DEFAULT_CACHE_PROPS)

    if (props.maxSize === null && props.timeToLive === null) {
      throw new Error('Invalid cache configuration, both maxSize and timeToLive are null')
    }

    return props
  }
}

export type CacheOptions = Partial<CacheProps>

export type CacheProviderConfiguration = CacheOptions & {
  type: string
}

export type CacheDefinition = {
  providers: Array<CacheProviderConfiguration>
}

export type CacheConfigurationSection = {
  defaultOptions: CacheDefinition

  /**
   * These options map from cache name key to configuration. They are a way for the tenant to override the configurations
   * for specific caches from the cache configuration here.
   */
  caches?: Record<string, Partial<CacheDefinition>>
}

export type CacheProviderRegistry = {
  type: string
  // JOHN context has type any
  constructor: <T extends CacheValue>(props: CacheProps, context: any) => CacheProvider<T> | null
}

export type CacheConfiguration = CacheConfigurationSection & {
  registry: Array<CacheProviderRegistry>
  local: CacheConfigurationSection
}
