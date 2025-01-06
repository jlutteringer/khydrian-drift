import React from 'react'
import { LabelContentType } from '@bessemer/cornerstone/content'
import { ContentElement, ContentElementProps } from '@bessemer/core/codex/component/ContentElement'

export const ContentLabel = ({ contentKey, defaultValue, options }: ContentElementProps<typeof LabelContentType>) => {
  return (
    <ContentElement
      contentKey={contentKey}
      defaultValue={defaultValue}
      options={{ ...options, type: LabelContentType }}
    />
  )
}
