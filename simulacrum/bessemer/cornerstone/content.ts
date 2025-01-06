import { Referencable, Reference, ReferenceType } from '@bessemer/cornerstone/reference'
import { NominalType } from '@bessemer/cornerstone/types'
import { AbstractApplicationContext } from '@bessemer/cornerstone/context'
import { Arrays, Objects, References, Tags, Uuids } from '@bessemer/cornerstone'
import { RichTextJson } from '@bessemer/cornerstone/rich-text'
import { Tag } from '@bessemer/cornerstone/tag'

export type ContentKey = NominalType<string, 'ContentKey'>
export type ContentType<Data = unknown> = NominalType<string, ['ContentType', Data]>

export type ContentReference = Reference<'Content'>

type ContentDataType<Type> = Type extends ContentType<infer Data> ? Data : never

export type ContentData<Type extends ContentType = ContentType, Data = ContentDataType<Type>> = Referencable<ContentReference> & {
  key: ContentKey
  type: Type
  data: Data
}

export type ContentTypeConstructor<Content extends ContentData> = Content['type']

export type ContentPayload<Content extends ContentData = ContentData> = Omit<Content, 'key' | 'reference'>

export const TextContentType: ContentType<RichTextJson> = 'Text'
export type TextContent = ContentData<typeof TextContentType>

// JOHN is LabelContentType really the way to go here? I worry it conflates the content data type with its display too much...
// Think a Trait page vs. a Trait tooltip - same content data but two different form factors
// Maybe form factor should become a first class thing... DisplayType?
export const LabelContentType: ContentType<RichTextJson> = 'Label'
export type LabelContent = ContentData<typeof LabelContentType>

export interface ContentProvider<ContextType extends AbstractApplicationContext = AbstractApplicationContext> {
  fetchContentByIds: (references: Array<ReferenceType<ContentReference>>, context: ContextType) => Promise<Array<ContentData>>

  fetchContentByKeys: (references: Array<ContentKey>, tags: Array<Tag>, context: ContextType) => Promise<Array<ContentData>>

  // JOHN pagination...
  fetchContentByModel: <Type extends ContentType>(type: Type, context: ContextType) => Promise<Array<ContentData<Type>>>
}

export type ContentNormalizer<
  ApplicationContext extends AbstractApplicationContext = AbstractApplicationContext,
  Type extends ContentData = ContentData
> = {
  type: Type['type']
  normalize: (data: Array<ContentData>, context: ApplicationContext) => Promise<Array<Type>>
}

// TODO might be more efficient to put the normalizers in a map at some point
export const normalizeContent = async <ApplicationContext extends AbstractApplicationContext>(
  content: Array<ContentData>,
  normalizers: Array<ContentNormalizer<ApplicationContext>>,
  context: ApplicationContext
): Promise<Array<ContentData>> => {
  const groupedContent = Arrays.groupBy(content, (it) => it.type)
  const normalizedGroupedContent = Object.entries(groupedContent).map(async ([type, values]) => {
    const normalizer = normalizers.find((it) => it.type === type)
    if (Objects.isNil(normalizer)) {
      return values
    }

    return await normalizer.normalize(values, context)
  })

  const normalizedContent = (await Promise.all(normalizedGroupedContent)).flatMap((it) => it)
  return normalizedContent
}

export type StaticContentData<Type extends ContentType = ContentType, Data = ContentDataType<Type>> = ContentData<Type, Data> & {
  tags?: Array<Tag>
}

export const staticData = <Type extends ContentType = ContentType, Data = ContentDataType<Type>>(
  key: ContentKey,
  type: Type,
  data: Data,
  tags?: Array<Tag>
): StaticContentData<Type, Data> => {
  return {
    reference: References.reference(Uuids.random(), 'Content'),
    key,
    type,
    data,
    tags,
  }
}

export const staticProvider = <ApplicationContext extends AbstractApplicationContext>(
  content: Array<StaticContentData>,
  normalizers?: Array<ContentNormalizer<ApplicationContext>>
): ContentProvider<ApplicationContext> => {
  return {
    async fetchContentByIds(references: Array<ReferenceType<ContentReference>>, context: ApplicationContext): Promise<Array<ContentData>> {
      const matchingContent = content.filter((it) => Arrays.contains(references, it.reference))
      return normalizeContent(matchingContent, normalizers ?? [], context)
    },
    async fetchContentByKeys(keys: Array<ContentKey>, tags: Array<Tag>, context: ApplicationContext): Promise<Array<ContentData>> {
      const matchingContent = content.filter((it) => Arrays.contains(keys, it.key))

      const resolvedContent = Object.values(Arrays.groupBy(matchingContent, (it) => it.key)).map((it) => {
        const resolvedContent = Tags.resolveBy(it, (it) => it.tags ?? [], tags)
        return Arrays.first(resolvedContent)!
      })

      return normalizeContent(resolvedContent, normalizers ?? [], context)
    },
    async fetchContentByModel<Type extends ContentType>(type: Type, context: ApplicationContext): Promise<Array<ContentData<Type>>> {
      const matchingContent = content.filter((it) => it.type === type)
      const normalizedContent = await normalizeContent(matchingContent, normalizers ?? [], context)
      return normalizedContent as Array<ContentData<Type>>
    },
  }
}
