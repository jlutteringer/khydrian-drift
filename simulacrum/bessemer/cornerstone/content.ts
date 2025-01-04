import { Referencable, Reference, ReferenceType } from '@bessemer/cornerstone/reference'
import { NominalType } from '@bessemer/cornerstone/types'
import { AbstractApplicationContext } from '@bessemer/cornerstone/context'
import { Arrays, Objects } from '@bessemer/cornerstone'
import { RichTextJson } from '@bessemer/cornerstone/rich-text'

export type ContentType<Data = unknown, T extends string = string> = NominalType<T, ['ContentType', Data]>

export type ContentReference = Reference<'Content'>

type ContentDataType<Type> = Type extends ContentType<infer Data> ? Data : never

export type ContentData<Type extends ContentType = ContentType, Data = ContentDataType<Type>> = Referencable<ContentReference> & {
  type: Type
  data: Data
}

export const TextContentType: ContentType<RichTextJson, 'Text'> = 'Text'
export type TextContent = ContentData<typeof TextContentType>

export interface ContentProvider<ContextType extends AbstractApplicationContext = AbstractApplicationContext> {
  fetchContent: (references: Array<ReferenceType<ContentReference>>, context: ContextType) => Promise<Array<ContentData>>

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

export const staticProvider = <ApplicationContext extends AbstractApplicationContext>(
  content: Array<ContentData>,
  normalizers?: Array<ContentNormalizer<ApplicationContext>>
): ContentProvider<ApplicationContext> => {
  return {
    async fetchContent(references: Array<ReferenceType<ContentReference>>, context: ApplicationContext): Promise<Array<ContentData>> {
      const matchingContent = content.filter((it) => Arrays.contains(references, it.reference))
      return normalizeContent(matchingContent, normalizers ?? [], context)
    },
    async fetchContentByModel<Type extends ContentType>(type: Type, context: ApplicationContext): Promise<Array<ContentData<Type>>> {
      const matchingContent = content.filter((it) => it.type === type)
      const normalizedContent = await normalizeContent(matchingContent, normalizers ?? [], context)
      return normalizedContent as Array<ContentData<Type>>
    },
  }
}
