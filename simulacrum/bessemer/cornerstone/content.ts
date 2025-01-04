import { Referencable, Reference, ReferenceType } from '@bessemer/cornerstone/reference'
import { NominalType } from '@bessemer/cornerstone/types'
import { AbstractApplicationContext } from '@bessemer/cornerstone/context'
import { Arrays, Objects } from '@bessemer/cornerstone'
import { RichTextDto } from '@bessemer/cornerstone/rich-text'

export type ContentType<Data = unknown, T extends string = string> = NominalType<T, ['ContentType', Data]>

export type ContentReference = Reference<'Content'>

type ContentDataType<Type> = Type extends ContentType<infer Data> ? Data : never

export type ContentData<Type extends ContentType = ContentType, Data = ContentDataType<Type>> = Referencable<ContentReference> & {
  type: Type
  data: Data
}

export const TextContentType: ContentType<RichTextDto, 'Text'> = 'Text'
export type TextContent = ContentData<typeof TextContentType>

export interface ContentProvider<ContextType extends AbstractApplicationContext = AbstractApplicationContext> {
  fetchContent: (references: Array<ReferenceType<ContentReference>>, context: ContextType) => Promise<Array<ContentData>>

  // JOHN pagination...
  fetchContentByModel: <Type extends ContentType>(type: Type, context: ContextType) => Promise<Array<ContentData<Type>>>
}

export type ContentNormalizer<Type extends ContentData = ContentData> = {
  type: Type['type']
  normalize: (data: Array<ContentData>) => Promise<Array<Type>>
}

// TODO might be more efficient to put the normalizers in a map at some point
export const normalizeContent = async (content: Array<ContentData>, normalizers: Array<ContentNormalizer>): Promise<Array<ContentData>> => {
  const groupedContent = Arrays.groupBy(content, (it) => it.type)
  const normalizedGroupedContent = Object.entries(groupedContent).map(async ([type, values]) => {
    const normalizer = normalizers.find((it) => it.type === type)
    if (Objects.isNil(normalizer)) {
      return values
    }

    return await normalizer.normalize(values)
  })

  const normalizedContent = (await Promise.all(normalizedGroupedContent)).flatMap((it) => it)
  return normalizedContent
}

export const staticProvider = (content: Array<ContentData>, normalizers?: Array<ContentNormalizer>): ContentProvider => {
  return {
    async fetchContent(references: Array<ReferenceType<ContentReference>>): Promise<Array<ContentData>> {
      const matchingContent = content.filter((it) => Arrays.contains(references, it.reference))
      return normalizeContent(matchingContent, normalizers ?? [])
    },
    async fetchContentByModel<Type extends ContentType>(type: Type): Promise<Array<ContentData<Type>>> {
      const matchingContent = content.filter((it) => it.type === type)
      const normalizedContent = await normalizeContent(matchingContent, normalizers ?? [])
      return normalizedContent as Array<ContentData<Type>>
    },
  }
}
