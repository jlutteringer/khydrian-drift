import { CodexRenderer } from '@bessemer/core/codex'
import { LabelContentType, TextContentType } from '@bessemer/cornerstone/content'
import { MuiRichTextRenderer } from '@bessemer/mui/component/MuiRichTextRenderer'
import { MuiRichLabelRenderer } from '@bessemer/mui/component/MuiRichLabelRenderer'

export const TextCodexRenderer: CodexRenderer<typeof TextContentType> = {
  type: TextContentType,
  render: (content) => {
    return <MuiRichTextRenderer content={content.data} />
  },
}

export const LabelCodexRenderer: CodexRenderer<typeof LabelContentType> = {
  type: LabelContentType,
  render: (content) => {
    return <MuiRichLabelRenderer content={content.data} />
  },
}
