import 'server-only'
import { PropertyRecord } from '@bessemer/cornerstone/property'
import { Content, Objects, Properties } from '@bessemer/cornerstone'
import { ApplicationOptions } from '@simulacrum/common/application'
import { ContentData, ContentNormalizer, TextContent, TextContentType } from '@bessemer/cornerstone/content'
import { RichText, RichTextDto } from '@bessemer/cornerstone/rich-text'
import { generateJSON } from '@tiptap/html'
import { StarterKit } from '@tiptap/starter-kit'

// JOHN this logic should not live here... needs to move
const TextContentNormalizer: ContentNormalizer<TextContent> = {
  type: TextContentType,
  normalize: async (initialData) => {
    const data = initialData as Array<ContentData<typeof TextContentType, RichText>>
    const normalizedData = data.map((it) => {
      if (Objects.isObject(it.data)) {
        return it as TextContent
      }

      const json = generateJSON(it.data, [StarterKit]) as RichTextDto
      const normalizedData: TextContent = { ...it, data: json }
      return normalizedData
    })

    return normalizedData
  },
}

const contentProvider = Content.staticProvider(
  [
    {
      reference: { id: 'test-content', type: 'Content' },
      type: TextContentType,
      data: 'Hello, World!',
    },
  ],
  [TextContentNormalizer]
)

export const ApplicationProperties: PropertyRecord<ApplicationOptions> = Properties.properties({
  ruleset: 'dnd',
  codex: {
    provider: contentProvider,
  },
  public: { test: 'hello' },
})
