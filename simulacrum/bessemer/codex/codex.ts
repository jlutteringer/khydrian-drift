import { ReferenceType } from '@bessemer/cornerstone/reference'
import { ContentReference } from '@bessemer/cornerstone/content'
import { ReactNode } from '@bessemer/react/type'
import { References } from '@bessemer/cornerstone'
import { ContentLabel, ContentText } from '@bessemer/codex'

export const label = (reference: ReferenceType<ContentReference>, defaultValue?: ReactNode): ContentLabel => {
  return {
    reference: References.reference(reference, 'Content'),
    defaultValue,
  }
}

export const text = (reference: ReferenceType<ContentReference>, defaultValue?: ReactNode): ContentText => {
  return {
    reference: References.reference(reference, 'Content'),
    defaultValue,
  }
}
