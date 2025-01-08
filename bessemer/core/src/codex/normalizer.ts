import { RichText } from '@bessemer/cornerstone/rich-text'
import { ContentData, ContentNormalizer, TextContent, TextContentType } from '@bessemer/cornerstone/content'
import { CoreApplicationContext } from '@bessemer/core/application'
import { Tiptap } from '@bessemer/core'

export const TextContentNormalizer: ContentNormalizer<CoreApplicationContext, TextContent> = {
  type: TextContentType,
  normalize: async (initialData, context: CoreApplicationContext) => {
    const data = initialData as Array<ContentData<typeof TextContentType, RichText>>
    const normalizedData = data.map((it) => {
      const json = Tiptap.textToJson(it.data, context)
      const normalizedData: TextContent = { ...it, data: json }
      return normalizedData
    })

    return normalizedData
  },
}
