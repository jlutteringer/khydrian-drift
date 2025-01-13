import { ContentData, ContentKey, ContentType } from '@bessemer/cornerstone/content'
import { FetchContentOptions } from '@bessemer/core/codex'
import { Urls } from '@bessemer/cornerstone'

// JOHN fully implement me
export const fetchContentByKey = async <Type extends ContentType>(
  key: ContentKey,
  options?: FetchContentOptions<Type>
): Promise<ContentData<Type> | undefined> => {
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
    return undefined
  }
  if (response.status !== 200) {
    throw new Error('oh noes')
  }

  const data = (await response.json()).content as ContentData<Type>
  return data
}
