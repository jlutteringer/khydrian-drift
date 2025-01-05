import { ContentKey, TextContent, TextContentType } from '@bessemer/cornerstone/content'
import { useFetchContent } from '@bessemer/core/codex/hooks/use-fetch-content'

// JOHN maybe temporary?
export const useFetchText = (key: ContentKey): TextContent | undefined => {
  return useFetchContent(key, { type: TextContentType })
}
