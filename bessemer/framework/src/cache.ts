import {
  Cache,
  CacheConfiguration,
  CacheConfigurationSection,
  CacheContext,
  CacheProps,
  CacheProvider,
  LocalCache,
  LocalCacheProvider,
} from '@bessemer/cornerstone/cache'
import { createGlobalVariable } from '@bessemer/cornerstone/global-variable'
import { BessemerApplicationContext } from '@bessemer/framework/index'
import { Objects, Preconditions } from '@bessemer/cornerstone'
import { CacheImpl } from '@bessemer/framework/cache/CacheImpl'
import { MemoryCacheProvider } from '@bessemer/framework/cache/MemoryCacheProvider'
import { LocalCacheImpl } from '@bessemer/framework/cache/LocalCacheImpl'

const DefaultCacheConfiguration: CacheConfiguration = {
  defaults: {
    providers: [{ type: MemoryCacheProvider.Type }],
  },
  local: {
    defaults: {
      providers: [{ type: MemoryCacheProvider.Type }],
    },
  },
}

export const configure = (cache?: CacheConfiguration): CacheContext => {
  const configuration = Objects.merge(DefaultCacheConfiguration, cache)

  return {
    providers: [MemoryCacheProvider.register()],
    configuration,
  }
}

type CacheManagerState = {
  cacheDirectory: Map<string, Cache<any>>
  localCacheDirectory: Map<string, LocalCache<any>>
}

const CacheManagerState = createGlobalVariable<CacheManagerState>('CacheManagerState', () => ({
  cacheDirectory: new Map(),
  localCacheDirectory: new Map(),
}))

// export const initialize = (context: TenantContext) => {
//   const applicationKeys = Object.keys(context.tenant.application.applicationDirectory)
//   const sections = applicationKeys.map((it) => CacheSection.of(Contexts.getApplicationStoreKey(it)))
//
//   // JOHN is this where this check should live?
//   if (typeof window === 'undefined') {
//     monitor.manage(new CacheMonitor(sections, context))
//   }
// }

export const getCache = <T>(name: string, context: BessemerApplicationContext): Cache<T> => {
  const cache = CacheManagerState.getValue().cacheDirectory.get(name)
  if (!Objects.isNil(cache)) {
    return cache
  }

  return createCache<T>(name, context)
}

export const getLocalCache = <T>(name: string, context: BessemerApplicationContext): LocalCache<T> => {
  const cache = CacheManagerState.getValue().localCacheDirectory.get(name)
  if (!Objects.isNil(cache)) {
    return cache
  }

  return createLocalCache<T>(name, context)
}

export const createCache = <T>(name: string, context: BessemerApplicationContext): Cache<T> => {
  const existingCache = CacheManagerState.getValue().cacheDirectory.get(name)
  Preconditions.isNil(existingCache, () => `Cache: ${name} already exists`)

  const providers = getProviders<T>(name, context.cache.configuration, context)
  const cache = new CacheImpl<T>(name, providers, context)
  CacheManagerState.getValue().cacheDirectory.set(name, cache)
  return cache
}

export const createLocalCache = <T>(name: string, context: BessemerApplicationContext): LocalCache<T> => {
  const existingCache = CacheManagerState.getValue().localCacheDirectory.get(name)
  Preconditions.isNil(existingCache, () => `Cache: ${name} already exists`)

  const providers = getProviders<T>(name, context.cache.configuration.local, context)
  const cache = new LocalCacheImpl<T>(name, providers as Array<LocalCacheProvider<T>>)
  CacheManagerState.getValue().localCacheDirectory.set(name, cache)
  return cache
}

const getProviders = <T>(name: string, configuration: CacheConfigurationSection, context: BessemerApplicationContext): Array<CacheProvider<T>> => {
  const defaultOptions = configuration?.defaults
  const specificOptions = configuration?.caches?.[name]
  const resolvedOptions = { ...defaultOptions, ...specificOptions }

  const constructedProviders = resolvedOptions.providers.map((provider) => {
    const targetRegistry = context.cache.providers.find((it) => it.type === provider.type)
    if (Objects.isNil(targetRegistry)) {
      throw new Error(`Unrecognized CacheProvider type: ${provider.type}`)
    }

    const props = CacheProps.buildCacheProps(provider)
    const providerInstance = targetRegistry.construct<T>(props, context)
    return providerInstance
  })

  return constructedProviders
}

// export const getCaches = (): Array<Cache<any>> => {
//   return [...state.cacheDirectory.values()]
// }
//
// export const invalidateSection = async (section: CacheSection): Promise<void> => {
//   await monitor.value.invalidateSection(section)
// }
