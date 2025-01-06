import { ContentData, ContentKey, ContentType } from '@bessemer/cornerstone/content'
import { FetchContentOptions } from '@bessemer/core/codex'
import { useFetchContent } from '@bessemer/core/codex/hooks/use-fetch-content'
import { Async, Objects } from '@bessemer/cornerstone'
import { useBessemerCommonContext } from '@bessemer/framework/hooks/use-common-context'
import { CoreApplicationContext } from '@bessemer/core/application'

// JOHN consider using content data as the type parameter?
export type ContentElementProps<Type extends ContentType> = {
  contentKey: ContentKey
  // JOHN need better type for defaults...
  defaultValue?: ContentData
  options?: FetchContentOptions<Type>
}

// JOHN better api... cant reference typography here ;_;
export const ContentElement = <Type extends ContentType>({ contentKey, defaultValue, options }: ContentElementProps<Type>) => {
  const response = useFetchContent(contentKey, options)

  return Async.handle(response, {
    // TODO better loading indicator
    loading: () => <span>Loading...</span>,
    error: () => <span>{`Failed Loading Content: [${contentKey}]`}</span>,
    absent: () => (defaultValue ? <ContentRenderer content={defaultValue} /> : <span>{`Missing Content: [${contentKey}]`}</span>),
    success: (content) => <ContentRenderer content={content} />,
  })
}

const ContentRenderer = ({ content }: { content: ContentData }) => {
  const context = useBessemerCommonContext<CoreApplicationContext>()
  const renderers = context.client.runtime.codex.renderers
  const matchingRenderer = renderers.find((it) => it.type === content.type)
  if (Objects.isNil(matchingRenderer)) {
    throw new Error(`Unable to find CodexRenderer for ContentType: ${content.type}`)
  }

  return matchingRenderer.render(content)
}
