import { ContentData, ContentKey, ContentType } from '@bessemer/cornerstone/content'
import { FetchContentOptions } from '@bessemer/core/codex/index'

export const fetchContentByKey = async <Type extends ContentType>(
  key: ContentKey,
  options?: FetchContentOptions<Type>
): Promise<ContentData<Type> | undefined> => {
  const response = await fetch(`/api/codex/key/${key}`)
  if (response.status === 404) {
    return undefined
  }
  if (response.status !== 200) {
    throw new Error('oh noes')
  }

  const data = (await response.json()).content as ContentData<Type>
  return data
}
