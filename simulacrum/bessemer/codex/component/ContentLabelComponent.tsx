import { ContentLabel } from '@bessemer/codex'

export const ContentLabelComponent = ({ content }: { content: ContentLabel }) => {
  return content.defaultValue ?? 'No Value'
}
