import { TextContent, TextContentType } from '@bessemer/cornerstone/content'
import { ContentElement, ContentElementProps } from '@bessemer/core/codex/component/ContentElement'

export const ContentText = ({ contentKey, options }: ContentElementProps<TextContent>) => {
  return (
    <ContentElement
      contentKey={contentKey}
      options={{ ...options, type: TextContentType }}
    />
  )
}
