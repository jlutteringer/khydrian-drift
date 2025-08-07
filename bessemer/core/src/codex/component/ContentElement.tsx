import {
  ContentData,
  ContentDisplayType,
  ContentDisplayTypes,
  ContentKey,
  ContentSector,
  ContentTypeConstructor,
} from '@bessemer/cornerstone/content'
import { FetchContentOptions } from '@bessemer/core/codex'
import { useFetchContent } from '@bessemer/core/codex/hooks/use-fetch-content'
import { Arrays, AsyncValues, Objects } from '@bessemer/cornerstone'
import { useBessemerCommonContext } from '@bessemer/framework-next/hooks/use-common-context'
import { CoreApplicationContext } from '@bessemer/core/application'
import { ReactNode } from 'react'

export type ContentElementProps<Content extends ContentData = ContentData> = {
  contentKey: ContentKey
  sector?: ContentSector
  displayType?: ContentDisplayType
  defaultValue?: ReactNode
  options?: FetchContentOptions<ContentTypeConstructor<Content>>
}

// JOHN better api... cant reference typography here ;_;
export const ContentElement = <Content extends ContentData>({
  contentKey,
  sector,
  displayType,
  defaultValue,
  options,
}: ContentElementProps<Content>) => {
  const response = useFetchContent(contentKey, sector, options)

  return AsyncValues.handle(response, {
    // TODO better loading indicator
    loading: () => <span>Loading...</span>,
    error: () => <span>{`Failed Loading Content: [${contentKey}]`}</span>,
    absent: () => (defaultValue ? defaultValue : <span>{`Missing Content: [${contentKey}]`}</span>),
    success: (content) => (
      <ContentRenderer
        content={content}
        displayType={displayType ?? ContentDisplayTypes.Default}
      />
    ),
  })
}

const ContentRenderer = ({ content, displayType }: { content: ContentData; displayType: ContentDisplayType }) => {
  const context = useBessemerCommonContext<CoreApplicationContext>()
  const renderers = context.client.runtime.codex.renderers
  const matchingRenderers = renderers.filter((it) => it.type === content.type)

  let matchingRenderer = matchingRenderers.find((it) => Arrays.contains(it.displayTypes, displayType))
  if (Objects.isNil(matchingRenderer)) {
    matchingRenderer = matchingRenderers.find((it) => Arrays.contains(it.displayTypes, ContentDisplayTypes.Default))
  }
  if (Objects.isNil(matchingRenderer)) {
    matchingRenderer = Arrays.first(matchingRenderers)
  }

  if (Objects.isNil(matchingRenderer)) {
    throw new Error(`Unable to find CodexRenderer for ContentType: ${content.type}`)
  }

  return matchingRenderer.render(content)
}
