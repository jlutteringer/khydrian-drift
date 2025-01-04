import { Codex } from '@bessemer/core'
import { Bessemer } from '@bessemer/framework'
import { use } from 'react'
import { MuiRichTextRenderer } from '@bessemer/mui/components/RichTextRenderer'

// JOHN bessemer core cant depend on mui...
export const ContentText = () => {
  const content = use(Codex.fetchText('test-content', Bessemer.getApplication()))
  return <MuiRichTextRenderer content={content.data} />
}
