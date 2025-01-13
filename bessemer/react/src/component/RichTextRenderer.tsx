import { ReactNode } from 'react'
import { RichTextJson } from '@bessemer/cornerstone/rich-text'
import { Objects } from '@bessemer/cornerstone'
import { Dictionary } from '@bessemer/cornerstone/types'

export type RichTextRendererProps = { content: RichTextJson; handlers?: Dictionary<RichTextElement> }

export type RichTextElementProps = {
  children?: ReactNode
  content: RichTextJson
}

export type RichTextElement = (props: RichTextElementProps) => ReactNode

export const RichTextRenderer = (props: RichTextRendererProps): ReactNode => {
  const { content, handlers = {} } = props

  const children: ReactNode[] = []
  if (Objects.isPresent(content.content)) {
    content.content.forEach((child, index) => {
      children.push(
        <RichTextRenderer
          content={child}
          handlers={handlers}
          key={`${child.type}-${index}`}
        />
      )
    })
  }

  if (Objects.isNil(content.type) || !(content.type in handlers)) {
    throw new Error(`Unable to resolve content type: ${content?.type}`)
  }

  const Handler = handlers[content.type]!
  return <Handler content={content}>{children}</Handler>
}
