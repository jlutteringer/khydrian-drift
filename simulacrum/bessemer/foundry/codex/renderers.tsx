import { CodexRenderer } from '@bessemer/core/codex'
import { ContentDisplayTypes, TextContent, TextContentType } from '@bessemer/cornerstone/content'
import { MuiRichTextRenderer } from '@bessemer/mui/component/MuiRichTextRenderer'
import { MuiRichLabelRenderer } from '@bessemer/mui/component/MuiRichLabelRenderer'

export const TextCodexRenderer: CodexRenderer<TextContent> = {
  type: TextContentType,
  displayTypes: [ContentDisplayTypes.Default],
  render: (content) => {
    return <MuiRichTextRenderer content={content.data} />
  },
}

export const LabelCodexRenderer: CodexRenderer<TextContent> = {
  type: TextContentType,
  displayTypes: [ContentDisplayTypes.Label],
  render: (content) => {
    return <MuiRichLabelRenderer content={content.data} />
  },
}
