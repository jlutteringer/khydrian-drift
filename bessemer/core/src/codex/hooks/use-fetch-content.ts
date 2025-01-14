import { ContentData, ContentKey, ContentType } from '@bessemer/cornerstone/content'
import { CoreApplicationContext } from '@bessemer/core/application'
import { Codex, CodexClient } from '@bessemer/core'
import { useQuery } from '@tanstack/react-query'
import { RscRuntimes } from '@bessemer/react'
import { FetchContentOptions } from '@bessemer/core/codex'
import { AsyncValue } from '@bessemer/cornerstone/async'
import { useAsync } from '@bessemer/react/hook/use-async'
import { BessemerNext } from '@bessemer/framework-next'

export const useFetchContent = <Type extends ContentType>(
  key: ContentKey,
  options?: FetchContentOptions<Type>
): AsyncValue<ContentData<Type> | undefined> => {
  if (RscRuntimes.isServer) {
    return useAsync(async () => {
      const application = await BessemerNext.getApplication<CoreApplicationContext>()
      const content = await Codex.fetchContentByKey(key, application, options)
      return content
    })
  }

  const result = useQuery({
    queryKey: ['useFetchContent', key],
    queryFn: async () => {
      return CodexClient.fetchContentByKey(key, options)
    },
  })

  return result
}
