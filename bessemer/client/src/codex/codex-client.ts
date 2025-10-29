import { ContentData, ContentDataSchema, ContentKey, ContentSector, ContentType } from '@bessemer/cornerstone/content'
import { Urls } from '@bessemer/cornerstone'
import { CodexClientContext, FetchContentOptions } from '@bessemer/client/codex/types'
import { isErrorFromPath, makeApi, Zodios } from '@zodios/core'
import Zod from 'zod'

const CodexApi = makeApi([
  {
    alias: 'fetchContentByKey',
    method: 'get',
    path: '/codex/key/:key',
    response: ContentDataSchema,
    parameters: [
      {
        name: 'type',
        description: 'TODO',
        type: 'Query',
        schema: Zod.string().optional(),
      },
      {
        name: 'tags',
        description: 'TODO',
        type: 'Query',
        schema: Zod.string().optional(),
      },
    ],
    errors: [
      {
        status: 404,
        schema: Zod.unknown(),
      },
    ],
  },
])

const client = new Zodios('/api', CodexApi)

// FUTURE fully implement me
export const fetchContentByKey = async <Type extends ContentType>(
  key: ContentKey,
  context: CodexClientContext,
  options?: FetchContentOptions<Type>
): Promise<ContentData<Type> | null> => {
  try {
    const content = await client.fetchContentByKey({ params: { key } })
    return content as ContentData<Type>
  } catch (e) {
    if (isErrorFromPath(CodexApi, 'get', '/codex/key/:key', e)) {
      if (e.response.status === 404) {
        return null
      }
    }

    throw e
  }

  const response = await fetch(
    Urls.toLiteral({
      location: {
        path: `/api/codex/key/${key}`,
        parameters: {
          ...(options?.type && { type: options?.type }),
          tags: JSON.stringify(options?.tags ?? []),
        },
      },
    })
  )

  if (response.status === 404) {
    return null
  }
  if (response.status !== 200) {
    throw new Error('oh noes')
  }

  const data = (await response.json()) as ContentData<Type>
  return data
}

export const fetchContentBySector = async <Type extends ContentType>(
  sector: ContentSector,
  context: CodexClientContext,
  options?: FetchContentOptions<Type>
): Promise<Array<ContentData<Type>>> => {
  const response = await fetch(
    Urls.toLiteral({
      location: {
        path: `/api/codex/sector/${sector}`,
        parameters: {
          ...(options?.type && { type: options?.type }),
          tags: JSON.stringify(options?.tags ?? []),
        },
      },
    })
  )

  if (response.status === 404) {
    return []
  }
  if (response.status !== 200) {
    throw new Error('oh noes')
  }

  const data = (await response.json()) as Array<ContentData<Type>>
  return data
}
