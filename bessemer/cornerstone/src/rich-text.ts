import { NominalType } from '@bessemer/cornerstone/types'
import { Objects } from '@bessemer/cornerstone'

// These are to match TipTap types, but without us having to depend on the TipTap library
export type RichTextJson = {
  type?: string
  attrs?: Record<string, any>
  content?: RichTextJson[]
  marks?: {
    type: string
    attrs?: Record<string, any>
    [key: string]: any
  }[]
  text?: string
  [key: string]: any
}

export type RichTextString = NominalType<string, 'RichTextString'>

export type RichText = RichTextString | RichTextJson

export const isJson = (text: RichText): text is RichTextJson => {
  return Objects.isObject(text)
}
