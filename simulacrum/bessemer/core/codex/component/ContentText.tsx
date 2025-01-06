import { TextContentType } from '@bessemer/cornerstone/content'
import { ContentElement, ContentElementProps } from '@bessemer/core/codex/component/ContentElement'

export const ContentText = ({ contentKey, defaultValue, options }: ContentElementProps<typeof TextContentType>) => {
  return (
    <ContentElement
      contentKey={contentKey}
      defaultValue={defaultValue}
      options={{ ...options, type: TextContentType }}
    />
  )
}
