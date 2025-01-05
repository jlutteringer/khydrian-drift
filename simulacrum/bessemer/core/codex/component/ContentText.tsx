import { Codex } from '@bessemer/core'
import { Bessemer } from '@bessemer/framework'
import { use } from 'react'
import { MuiRichTextRenderer } from '@bessemer/mui/components/RichTextRenderer'
import { CoreApplicationContext } from '@bessemer/core/application'
import { Objects } from '@bessemer/cornerstone'

// JOHN bessemer core cant depend on mui...
export const ContentText = () => {
  const application = use(Bessemer.getApplication<CoreApplicationContext>())
  const content = use(Codex.fetchTextByKey('test-content', [], application))
  if (Objects.isNil(content)) {
    return 'No content found...'
  }
  return <MuiRichTextRenderer content={content.data} />
}
