import { TextContent, TextContentType } from '@bessemer/cornerstone/content'
import { ContentElement, ContentElementProps } from '@bessemer/core/codex/component/ContentElement'
import { SetRequired } from 'type-fest'

export const ContentText = (props: SetRequired<Omit<ContentElementProps<TextContent>, 'type'>, 'defaultValue'>) => {
  return (
    <ContentElement
      {...props}
      options={{ ...props.options, type: TextContentType }}
    />
  )
}
