import { ContentData, ContentKey, ContentType } from '@bessemer/cornerstone/content'
import { Async, Durations } from '@bessemer/cornerstone'
import { Bessemer } from '@bessemer/framework'
import { CoreApplicationContext } from '@bessemer/core/application'
import { Codex, CodexClient } from '@bessemer/core'
import { useQuery } from '@tanstack/react-query'
import { RscRuntimes } from '@bessemer/react'
import { FetchContentOptions } from '@bessemer/core/codex'
import { AsyncValue } from '@bessemer/cornerstone/async'
import { use } from 'react'

export const useFetchContent = <Type extends ContentType>(
  key: ContentKey,
  options?: FetchContentOptions<Type>
): AsyncValue<ContentData<Type> | undefined> => {
  if (RscRuntimes.isServer) {
    return use(
      Async.blah(async () => {
        const application = await Bessemer.getApplication<CoreApplicationContext>()
        const content = await Codex.fetchContentByKey(key, application, options)
        return content
      })
    )
  }

  const result = useQuery({
    queryKey: ['useFetchContent', key],
    queryFn: async () => {
      // JOHN temp await
      await Async.sleep(Durations.ofSeconds(5))
      return CodexClient.fetchContentByKey(key, options)
    },
  })

  return result
}
