import { NominalType } from '@bessemer/cornerstone/types'

// These are to match TipTap types, but without us having to depend on the TipTap library
export type RichTextDto = {
  type?: string
  attrs?: Record<string, any>
  content?: RichTextDto[]
  marks?: {
    type: string
    attrs?: Record<string, any>
    [key: string]: any
  }[]
  text?: string
  [key: string]: any
}

export type RichTextHtml = NominalType<string, 'RichTextHtml'>

export type RichText = string | RichTextHtml | RichTextDto
