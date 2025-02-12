import { CacheClientContext, CacheDetail, CacheEvictRequest, CacheSummary, CacheWriteRequest } from '@bessemer/client/cache/types'
import { Urls } from '@bessemer/cornerstone'

export const getCaches = async (context: CacheClientContext): Promise<Array<CacheSummary>> => {
  const response = await fetch(
    Urls.buildString({
      location: '/api/cache',
    })
  )

  if (response.status !== 200) {
    throw new Error('oh noes')
  }

  const data = (await response.json()) as Array<CacheSummary>
  return data
}

export const getCacheDetail = async (name: string, context: CacheClientContext): Promise<CacheDetail | null> => {
  const response = await fetch(
    Urls.buildString({
      location: `/api/cache/${name}`,
    })
  )

  if (response.status === 404) {
    return null
  }
  if (response.status !== 200) {
    throw new Error('oh noes')
  }

  const data = (await response.json()) as CacheDetail | null
  return data
}

export const evictValues = async (request: CacheEvictRequest, context: CacheClientContext): Promise<void> => {
  const response = await fetch(
    Urls.buildString({
      location: '/api/cache/evict',
    }),
    { method: 'POST', body: JSON.stringify(request) }
  )

  if (response.status !== 200) {
    throw new Error('oh noes')
  }

  return
}

export const writeValues = async (request: CacheWriteRequest, context: CacheClientContext): Promise<void> => {
  const response = await fetch(
    Urls.buildString({
      location: '/api/cache/write',
    }),
    { method: 'POST', body: JSON.stringify(request) }
  )

  if (response.status !== 200) {
    throw new Error('oh noes')
  }

  return
}
