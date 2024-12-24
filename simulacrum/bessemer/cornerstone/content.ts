import { Referencable, Reference } from '@bessemer/cornerstone/reference'
import { NominalType } from '@bessemer/cornerstone/types'

export type ContentType = NominalType<string, 'ContentType'>

export type ContentReference = Reference<'Content'>

export interface Content extends Referencable<ContentReference> {
  type: ContentType
}
