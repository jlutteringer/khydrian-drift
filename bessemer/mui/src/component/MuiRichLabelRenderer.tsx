import { ReactNode, useMemo } from 'react'
import { RichTextElement, RichTextRenderer, RichTextRendererProps } from '@bessemer/react/component/RichTextRenderer'
import { Dictionary } from '@bessemer/cornerstone/types'
import { Objects } from '@bessemer/cornerstone'
import { DocTextElement, HardBreakTextElement, TextTextElement } from '@bessemer/mui/component/MuiRichTextRenderer'

const paragraph: RichTextElement = (props) => {
  return <span>{props.children}</span>
}

const defaultHandlers: Dictionary<RichTextElement> = {
  doc: DocTextElement,
  paragraph,
  text: TextTextElement,
  hardBreak: HardBreakTextElement,
}

export const MuiRichLabelRenderer = ({ content, handlers }: RichTextRendererProps): ReactNode => {
  const mergedHandlers = useMemo(() => {
    return Objects.deepMerge(defaultHandlers, handlers)
  }, [handlers])

  return (
    <RichTextRenderer
      content={content}
      handlers={mergedHandlers}
    />
  )
}
