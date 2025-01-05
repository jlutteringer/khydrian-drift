import { ContentData, ContentKey, ContentType } from '@bessemer/cornerstone/content'
import { Async, Durations } from '@bessemer/cornerstone'
import { use } from 'react'
import { Bessemer } from '@bessemer/framework'
import { CoreApplicationContext } from '@bessemer/core/application'
import { Codex, CodexClient } from '@bessemer/core'
import { useQuery } from '@tanstack/react-query'
import { RscRuntimes } from '@bessemer/react'
import { FetchContentOptions } from '@bessemer/core/codex'

export const useFetchContent = <Type extends ContentType>(key: ContentKey, options?: FetchContentOptions<Type>): ContentData<Type> | undefined => {
  if (RscRuntimes.isServer()) {
    const application = use(Bessemer.getApplication<CoreApplicationContext>())
    return use(Codex.fetchContentByKey(key, application, options))
  }

  const { data } = useQuery({
    queryKey: ['useFetchContent', key],
    queryFn: async () => {
      // JOHN temp await
      await Async.sleep(Durations.ofSeconds(5))
      return CodexClient.fetchContentByKey(key, options)
    },
  })

  return data
}
