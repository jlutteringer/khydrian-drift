import { ContentData, ContentKey, ContentSector, ContentType } from '@bessemer/cornerstone/content'
import { CoreApplicationContext, CoreClientContext } from '@bessemer/core/application'
import { Codex } from '@bessemer/core'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { RscRuntimes } from '@bessemer/react'
import { FetchContentOptions } from '@bessemer/core/codex'
import { useAsync } from '@bessemer/react/hook/use-async'
import { BessemerNext } from '@bessemer/framework-next'
import { AsyncValues, Objects } from '@bessemer/cornerstone'
import { CodexClient } from '@bessemer/client'
import { useBessemerClientContext } from '@bessemer/framework-next/hooks/use-client-context'
import { AsyncValue } from '@bessemer/cornerstone/async-value'

// FUTURE lots of type coercion in here...
export const useFetchContent = <Type extends ContentType>(
  key: ContentKey,
  sector?: ContentSector,
  options?: FetchContentOptions<Type>
): AsyncValue<ContentData<Type> | null> => {
  if (RscRuntimes.isServer) {
    return useAsync(async () => {
      const application = await BessemerNext.getApplication<CoreApplicationContext>()

      if (Objects.isPresent(sector)) {
        const content = await Codex.fetchContentBySector(sector, application, options)
        const targetContent = content.find((it) => it.key === key)

        if (Objects.isPresent(targetContent)) {
          return targetContent
        }
      }

      const content = await Codex.fetchContentByKey(key, application, options)
      return content
    })
  }

  const context = useBessemerClientContext<CoreClientContext>()
  const queryClient = useQueryClient()
  const contentItemQueryKey = ['useFetchContentByKey', key, sector]

  const contentSectorResult: AsyncValue<Array<ContentData<Type>>> = useQuery<Array<ContentData<Type>>>({
    queryKey: ['useFetchContentBySector', sector],
    queryFn: async () => {
      if (Objects.isNil(sector)) {
        return []
      }

      const content = await CodexClient.fetchContentBySector(sector, context, options)
      content.forEach((it) => {
        queryClient.setQueryData(contentItemQueryKey, it)
      })

      return content
    },
  })

  const targetContentResult = AsyncValues.map(contentSectorResult, (it) => it.find((it) => it.key === key) ?? null)

  const useSector = Objects.isPresent(sector) && (targetContentResult.isLoading || Objects.isPresent(targetContentResult.data))

  const contentItemResult: AsyncValue<ContentData<Type> | null> = useQuery<ContentData<Type> | null>({
    queryKey: contentItemQueryKey,
    queryFn: async () => {
      if (useSector) {
        return null
      }

      return (await CodexClient.fetchContentByKey(key, context, options)) ?? null
    },
    enabled: !targetContentResult.isLoading,
  })

  if (useSector) {
    return targetContentResult
  } else {
    return contentItemResult
  }
}
