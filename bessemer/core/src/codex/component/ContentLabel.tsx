import React from 'react'
import { ContentDisplayTypes, TextContent, TextContentType } from '@bessemer/cornerstone/content'
import { ContentElement, ContentElementProps } from '@bessemer/core/codex/component/ContentElement'
import { RequireField } from '@bessemer/cornerstone/types'

export const ContentLabel = ({ contentKey, defaultValue, options }: RequireField<ContentElementProps<TextContent>, 'defaultValue'>) => {
  return (
    <ContentElement
      contentKey={contentKey}
      displayType={ContentDisplayTypes.Label}
      defaultValue={defaultValue}
      options={{ ...options, type: TextContentType }}
    />
  )
}
