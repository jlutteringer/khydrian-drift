import {
  CacheClientContext,
  CacheDetail,
  CacheDetailSchema,
  CacheEvictRequest,
  CacheEvictRequestSchema,
  CacheSummary,
  CacheSummarySchema,
  CacheWriteRequest,
  CacheWriteRequestSchema,
} from '@bessemer/client/cache/types'
import { Zod } from '@bessemer/cornerstone'
import { isErrorFromPath, makeApi, Zodios } from '@zodios/core'

const CacheApi = makeApi([
  {
    alias: 'fetchCaches',
    method: 'get',
    path: '/cache',
    response: Zod.array(CacheSummarySchema),
  },
  {
    alias: 'fetchCacheDetail',
    method: 'get',
    path: '/cache/:name',
    response: CacheDetailSchema,
    errors: [
      {
        status: 404,
        schema: Zod.unknown(),
      },
    ],
  },
  {
    alias: 'evictValues',
    method: 'post',
    path: '/cache/evict',
    response: Zod.unknown(),
    parameters: [
      {
        name: 'CacheEvictRequest',
        description: 'TODO',
        type: 'Body',
        schema: CacheEvictRequestSchema,
      },
    ],
  },
  {
    alias: 'writeValues',
    method: 'post',
    path: '/cache/write',
    response: Zod.unknown(),
    parameters: [
      {
        name: 'CacheWriteRequest',
        description: 'TODO',
        type: 'Body',
        schema: CacheWriteRequestSchema,
      },
    ],
  },
])

const client = new Zodios('/api', CacheApi)

export const fetchCaches = async (context: CacheClientContext): Promise<Array<CacheSummary>> => {
  return await client.fetchCaches()
}

export const fetchCacheDetail = async (name: string, context: CacheClientContext): Promise<CacheDetail | null> => {
  try {
    const data = await client.fetchCacheDetail({ params: { name } })
    return data
  } catch (e) {
    if (isErrorFromPath(CacheApi, 'get', '/cache/:name', e)) {
      if (e.response.status === 404) {
        return null
      }
    }

    throw e
  }
}

export const evictValues = async (request: CacheEvictRequest, context: CacheClientContext): Promise<void> => {
  await client.evictValues(request)
}

export const writeValues = async (request: CacheWriteRequest, context: CacheClientContext): Promise<void> => {
  await client.writeValues(request)
}
