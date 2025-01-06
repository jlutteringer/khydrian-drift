import { ContentData, ContentKey, ContentPayload, ContentTypeConstructor } from '@bessemer/cornerstone/content'
import { FetchContentOptions } from '@bessemer/core/codex'
import { useFetchContent } from '@bessemer/core/codex/hooks/use-fetch-content'
import { Async, Objects } from '@bessemer/cornerstone'
import { useBessemerCommonContext } from '@bessemer/framework/hooks/use-common-context'
import { CoreApplicationContext } from '@bessemer/core/application'
import { ReactNode } from 'react'

export type ContentElementProps<Content extends ContentData = ContentData> = {
  contentKey: ContentKey
  defaultValue?: ReactNode
  options?: FetchContentOptions<ContentTypeConstructor<Content>>
}

// JOHN better api... cant reference typography here ;_;
export const ContentElement = <Content extends ContentData>({ contentKey, defaultValue, options }: ContentElementProps<Content>) => {
  const response = useFetchContent(contentKey, options)

  return Async.handle(response, {
    // TODO better loading indicator
    loading: () => <span>Loading...</span>,
    error: () => <span>{`Failed Loading Content: [${contentKey}]`}</span>,
    absent: () => (defaultValue ? defaultValue : <span>{`Missing Content: [${contentKey}]`}</span>),
    success: (content) => <ContentRenderer content={content} />,
  })
}

const ContentRenderer = ({ content }: { content: ContentPayload }) => {
  const context = useBessemerCommonContext<CoreApplicationContext>()
  const renderers = context.client.runtime.codex.renderers
  const matchingRenderer = renderers.find((it) => it.type === content.type)
  if (Objects.isNil(matchingRenderer)) {
    throw new Error(`Unable to find CodexRenderer for ContentType: ${content.type}`)
  }

  return matchingRenderer.render(content)
}
