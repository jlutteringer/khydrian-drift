import {
  Cache,
  CacheConfiguration,
  CacheConfigurationSection,
  CacheName,
  CacheProps,
  CacheProvider,
  CacheProviderRegistry,
  LocalCache,
  LocalCacheProvider,
} from '@bessemer/cornerstone/cache'
import { createGlobalVariable } from '@bessemer/cornerstone/global-variable'
import { BessemerApplicationContext, GlobalContextType } from '@bessemer/framework/index'
import { Objects, Preconditions } from '@bessemer/cornerstone'
import { CacheImpl } from '@bessemer/framework/cache/CacheImpl'
import { MemoryCacheProvider } from '@bessemer/framework/cache/MemoryCacheProvider'
import { LocalCacheImpl } from '@bessemer/framework/cache/LocalCacheImpl'
import { CacheManager, LocalCacheManager } from '@bessemer/framework/cache/cache-manager'
import { CacheStore } from '@bessemer/framework/cache/CacheStore'
import { CacheDetail, CacheEvictRequest, CacheSummary, CacheWriteRequest } from '@bessemer/client/cache/types'

export type CacheContext = {
  providers: Array<CacheProviderRegistry<any>>
  configuration: CacheConfiguration
  manager: CacheManager
}

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

const CacheStoreState = createGlobalVariable<CacheStore>('CacheStore', () => new CacheStore())

export const getStore = (): CacheStore => {
  return CacheStoreState.getValue()
}

export const configure = (cache?: CacheConfiguration): CacheContext => {
  const configuration = Objects.merge(DefaultCacheConfiguration, cache)

  return {
    providers: [MemoryCacheProvider.register()],
    configuration,
    manager: new LocalCacheManager(),
  }
}

export const getCache = <T>(name: string, context: GlobalContextType<BessemerApplicationContext>): Cache<T> => {
  const cache = getStore().caches.getValue(name) as Cache<T> | undefined
  if (!Objects.isNil(cache)) {
    return cache
  }

  return createCache<T>(name, context)
}

export const getLocalCache = <T>(name: string, context: GlobalContextType<BessemerApplicationContext>): LocalCache<T> => {
  const cache = getStore().localCaches.getValue(name) as LocalCache<T> | undefined
  if (!Objects.isNil(cache)) {
    return cache
  }

  return createLocalCache<T>(name, context)
}

export const createCache = <T>(name: string, context: GlobalContextType<BessemerApplicationContext>): Cache<T> => {
  const existingCache = getStore().caches.getValue(name)
  Preconditions.isNil(existingCache, () => `Cache: ${name} already exists`)

  const providers = getProviders<T>(name, getContext(context).configuration, context)
  const cache = new CacheImpl<T>(name, providers, context)
  getStore().caches.setValue(name, cache)
  return cache
}

export const createLocalCache = <T>(name: string, context: GlobalContextType<BessemerApplicationContext>): LocalCache<T> => {
  const existingCache = getStore().caches.getValue(name)
  Preconditions.isNil(existingCache, () => `Cache: ${name} already exists`)

  const providers = getProviders<T>(name, getContext(context).configuration.local, context)
  const cache = new LocalCacheImpl<T>(name, providers as Array<LocalCacheProvider<T>>)
  getStore().localCaches.setValue(name, cache)
  return cache
}

const getProviders = <T>(
  name: string,
  configuration: CacheConfigurationSection,
  context: GlobalContextType<BessemerApplicationContext>
): Array<CacheProvider<T>> => {
  const defaultOptions = configuration.defaults
  const specificOptions = configuration.caches?.[name]
  const resolvedOptions = { ...defaultOptions, ...specificOptions }

  const constructedProviders = resolvedOptions.providers.map((provider) => {
    const targetRegistry = getContext(context).providers.find((it) => it.type === provider.type)
    if (Objects.isNil(targetRegistry)) {
      throw new Error(`Unrecognized CacheProvider type: ${provider.type}`)
    }

    const props = CacheProps.buildCacheProps(provider)
    const providerInstance = targetRegistry.construct<T>(props, context)
    return providerInstance
  })

  return constructedProviders
}

export const getCaches = async (context: GlobalContextType<BessemerApplicationContext>): Promise<Array<CacheSummary>> => {
  return await getManager(context).getCaches(context)
}

export const getCacheDetails = async (name: CacheName, context: GlobalContextType<BessemerApplicationContext>): Promise<CacheDetail | null> => {
  return await getManager(context).getCacheDetails(name, context)
}

export const evictValues = async (request: CacheEvictRequest, context: GlobalContextType<BessemerApplicationContext>): Promise<void> => {
  await getManager(context).evictValues(request, context)
}

export const writeValues = async (request: CacheWriteRequest, context: GlobalContextType<BessemerApplicationContext>): Promise<void> => {
  await getManager(context).writeValues(request, context)
}

const getContext = (context: GlobalContextType<BessemerApplicationContext>): CacheContext => {
  return context.global.cache
}

const getManager = (context: GlobalContextType<BessemerApplicationContext>): CacheManager => {
  return getContext(context).manager
}
