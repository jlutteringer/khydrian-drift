import { ContentData, ContentKey, ContentSector, ContentType } from '@bessemer/cornerstone/content'
import { Urls } from '@bessemer/cornerstone'
import { CodexClientContext, FetchContentOptions } from '@bessemer/client/codex/types'

// JOHN fully implement me
export const fetchContentByKey = async <Type extends ContentType>(
  key: ContentKey,
  context: CodexClientContext,
  options?: FetchContentOptions<Type>
): Promise<ContentData<Type> | null> => {
  const response = await fetch(
    Urls.buildString({
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
    Urls.buildString({
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
