import { cache, use } from 'react'
import { Preconditions } from '@bessemer/cornerstone'

export const create = <T>(): ServerContext<T> => {
  Preconditions.isServerSide()

  const getCache: () => { promise: Promise<T> | undefined } = cache(() => {
    return { promise: undefined }
  })

  return {
    fetchValue: (fetch: () => Promise<T>) => {
      const promise = getCache().promise
      if (promise) {
        return use(promise)
      } else {
        const result = fetch()
        getCache().promise = result
        return use(result)
      }
    },
  }
}

export type ServerContext<T> = {
  fetchValue: (fetch: () => Promise<T>) => T
}
