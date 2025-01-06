import React from 'react'
import { LabelContent, LabelContentType } from '@bessemer/cornerstone/content'
import { ContentElement, ContentElementProps } from '@bessemer/core/codex/component/ContentElement'
import { RequireField } from '@bessemer/cornerstone/types'

export const ContentLabel = ({ contentKey, defaultValue, options }: RequireField<ContentElementProps<LabelContent>, 'defaultValue'>) => {
  return (
    <ContentElement
      contentKey={contentKey}
      defaultValue={defaultValue}
      options={{ ...options, type: LabelContentType }}
    />
  )
}
