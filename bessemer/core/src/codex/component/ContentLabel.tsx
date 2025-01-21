import { ContentDisplayTypes, TextContent, TextContentType } from '@bessemer/cornerstone/content'
import { ContentElement, ContentElementProps } from '@bessemer/core/codex/component/ContentElement'
import { SetRequired } from 'type-fest'

export const ContentLabel = ({ contentKey, sector, defaultValue, options }: SetRequired<ContentElementProps<TextContent>, 'defaultValue'>) => {
  return (
    <ContentElement
      contentKey={contentKey}
      sector={sector}
      displayType={ContentDisplayTypes.Label}
      defaultValue={defaultValue}
      options={{ ...options, type: TextContentType }}
    />
  )
}
