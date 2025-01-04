import { RichText, RichTextJson, RichTextString } from '@bessemer/cornerstone/rich-text'
import { CoreApplicationContext } from '@bessemer/core/application'
import { Extension } from '@tiptap/core'
import { StarterKit } from '@tiptap/starter-kit'
import { generateHTML, generateJSON } from '@tiptap/html'
import { RichTexts, Strings } from '@bessemer/cornerstone'

export type TiptapExtension = Extension

export const DefaultExtensions: Array<TiptapExtension> = [StarterKit]

const getExtensions = (context: CoreApplicationContext): Array<TiptapExtension> => {
  return context.tiptapExtensions
}

export const textToJson = (text: RichText, context: CoreApplicationContext): RichTextJson => {
  if (RichTexts.isJson(text)) {
    return text
  }

  return generateJSON(text, getExtensions(context)) as RichTextJson
}

export const jsonToString = (text: RichTextJson, context: CoreApplicationContext): RichTextString => {
  let html = generateHTML(text, getExtensions(context))
  html = Strings.removeStart(html, '<p>')
  html = Strings.removeEnd(html, '</p>')
  return html
}
