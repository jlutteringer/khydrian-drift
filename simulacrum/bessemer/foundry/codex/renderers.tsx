import { CodexRenderer } from '@bessemer/core/codex'
import { LabelContentType, TextContent, TextContentType } from '@bessemer/cornerstone/content'
import { MuiRichTextRenderer } from '@bessemer/mui/component/MuiRichTextRenderer'
import { MuiRichLabelRenderer } from '@bessemer/mui/component/MuiRichLabelRenderer'

export const TextCodexRenderer: CodexRenderer<TextContent> = {
  type: TextContentType,
  render: (content) => {
    return <MuiRichTextRenderer content={content.data} />
  },
}

export const LabelCodexRenderer: CodexRenderer<TextContent> = {
  type: LabelContentType,
  render: (content) => {
    return <MuiRichLabelRenderer content={content.data} />
  },
}
