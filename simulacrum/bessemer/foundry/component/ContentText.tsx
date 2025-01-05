import { MuiRichTextRenderer } from '@bessemer/mui/component/RichTextRenderer'
import { Objects } from '@bessemer/cornerstone'
import { useFetchText } from '@bessemer/core/codex/hooks/use-fetch-text'

export const ContentText = () => {
  const content = useFetchText('test-content')
  if (Objects.isNil(content)) {
    return null
  }

  return <MuiRichTextRenderer content={content.data} />
}
