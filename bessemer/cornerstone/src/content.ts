import { Referencable, Reference, ReferenceType } from '@bessemer/cornerstone/reference'
import { TaggedType } from '@bessemer/cornerstone/types'
import { AbstractApplicationContext } from '@bessemer/cornerstone/context'
import { Arrays, Objects, References, Tags, Ulids } from '@bessemer/cornerstone'
import { RichTextJson } from '@bessemer/cornerstone/rich-text'
import { Tag } from '@bessemer/cornerstone/tag'
import Zod, { ZodType } from 'zod'

export type ContentSector = TaggedType<string, 'ContentSector'>
export const ContentSectorSchema: ZodType<ContentSector> = Zod.string()

export type ContentKey = TaggedType<string, 'ContentKey'>
export const ContentKeySchema: ZodType<ContentKey> = Zod.string()

export type ContentType<Data = unknown> = TaggedType<string, ['ContentType', Data]>
export const ContentTypeSchema: ZodType<ContentType> = Zod.string()

export type ContentReference = Reference<'Content'>

type ContentDataType<Type> = Type extends ContentType<infer Data> ? Data : never

export const ContentDataSchema = Zod.object({
  key: ContentKeySchema,
  type: ContentTypeSchema,
  data: Zod.unknown(),
  sector: ContentSectorSchema.nullable(),
})

export type ContentData<Type extends ContentType = ContentType, Data = ContentDataType<Type>> = Referencable<ContentReference> & {
  key: ContentKey
  type: Type
  data: Data
  sector: ContentSector | null
}

export type ContentTypeConstructor<Content extends ContentData> = Content['type']

export type ContentDisplayType = TaggedType<string, 'ContentDisplayType'>

export namespace ContentDisplayTypes {
  export const Default: ContentDisplayType = 'Default'
  export const Label: ContentDisplayType = 'Label'
  export const Desktop: ContentDisplayType = 'Desktop'
  export const Mobile: ContentDisplayType = 'Mobile'
  export const Modal: ContentDisplayType = 'Modal'
  export const Tooltip: ContentDisplayType = 'Tooltip'
}

export const TextContentType: ContentType<RichTextJson> = 'Text'
export type TextContent = ContentData<typeof TextContentType>

export interface ContentProvider<ContextType extends AbstractApplicationContext = AbstractApplicationContext> {
  fetchContentByIds: (references: Array<ReferenceType<ContentReference>>, context: ContextType) => Promise<Array<ContentData>>

  fetchContentByKeys: (keys: Array<ContentKey>, tags: Array<Tag>, context: ContextType) => Promise<Array<ContentData>>

  fetchContentBySectors: (sectors: Array<ContentSector>, tags: Array<Tag>, context: ContextType) => Promise<Array<ContentData>>
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
  tags: Array<Tag>
}

export const staticData = <Type extends ContentType = ContentType, Data = ContentDataType<Type>>(
  key: ContentKey,
  type: Type,
  data: Data,
  options?: { tags?: Array<Tag>; sector?: ContentSector }
): StaticContentData<Type, Data> => {
  return {
    reference: References.reference(Ulids.generate() as string, 'Content'),
    key,
    type,
    data,
    tags: options?.tags ?? [],
    sector: options?.sector ?? null,
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
    async fetchContentBySectors(sectors: Array<ContentSector>, tags: Array<Tag>, context: ApplicationContext): Promise<Array<ContentData>> {
      const matchingContent = content.filter((it) => Objects.isPresent(it.sector)).filter((it) => Arrays.contains(sectors, it.sector!))

      const resolvedContent = Object.values(Arrays.groupBy(matchingContent, (it) => it.key)).map((it) => {
        const resolvedContent = Tags.resolveBy(it, (it) => it.tags ?? [], tags)
        return Arrays.first(resolvedContent)!
      })

      return normalizeContent(resolvedContent, normalizers ?? [], context)
    },
  }
}
