import { cache, Context as ClientContext, createContext as createClientContext, ReactNode, use as useClient } from 'react'
import { Isomorphic, Preconditions } from '@bessemer/cornerstone'

export const createContext = <T>(defaultValue: T): IsomorphicContex<T> => {
  if (Isomorphic.isClient()) {
    return createClientContext(defaultValue)
  } else {
    return createServerContext(defaultValue)
  }
}

export const use = <T>(context: IsomorphicContex<T>): T => {
  if (Isomorphic.isClient()) {
    return useClient(context as ClientContext<T>)
  } else {
    return getServerContext(context as ServerContext<T>)
  }
}

export type IsomorphicContex<T> = {
  Provider: ({ children, value }: { children: ReactNode; value: T }) => ReactNode
  Consumer: ({ children }: { children: (context: T | undefined) => ReactNode }) => ReactNode
}

const createServerContext = <T>(defaultValue: T): ServerContext<T> => {
  Preconditions.isServerSide()

  const getCache: () => { value: T } = cache(() => ({
    value: defaultValue,
  }))

  return {
    Provider: ({ children, value }) => {
      getCache().value = value
      return children
    },
    Consumer: ({ children }) => {
      const store = getCache()
      return children(store ? store.value : defaultValue)
    },
    _storage: getCache,
    _defaultValue: defaultValue,
  }
}

const getServerContext = <T>({ _storage, _defaultValue }: ServerContext<T>) => {
  Preconditions.isServerSide()

  const store = _storage()
  if (!store) {
    return _defaultValue
  }

  return store.value
}

export type ServerContext<T> = IsomorphicContex<T> & {
  _storage: () => { value: T }
  _defaultValue: T
}
