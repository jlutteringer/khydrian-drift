import { Referencable, Reference, ReferenceType } from '@bessemer/cornerstone/reference'
import { NominalType } from '@bessemer/cornerstone/types'
import { AbstractApplicationContext } from '@bessemer/cornerstone/context'
import { Arrays } from '@bessemer/cornerstone'
import { RichTextDto } from '@bessemer/cornerstone/rich-text'

export type ContentType<Data = unknown> = NominalType<string, ['ContentType', Data]>

export type ContentReference = Reference<'Content'>

type ContentDataType<Type> = Type extends ContentType<infer Data> ? Data : never

export type ContentData<Type extends ContentType> = Referencable<ContentReference> & {
  type: Type
  data: ContentDataType<Type>
}

export const TextContentType: ContentType<RichTextDto> = 'Text'
export type TextContent = ContentData<typeof TextContentType>

export interface ContentProvider<ContextType extends AbstractApplicationContext = AbstractApplicationContext> {
  fetchContent: (references: Array<ReferenceType<ContentReference>>, context: ContextType) => Promise<Array<ContentData<ContentType>>>

  // JOHN pagination...
  fetchContentByModel: <Type extends ContentType>(type: Type, context: ContextType) => Promise<Array<ContentData<Type>>>
}

export const staticProvider = (content: Array<ContentData<ContentType>>): ContentProvider => {
  return {
    async fetchContent(references: Array<ReferenceType<ContentReference>>): Promise<Array<ContentData<ContentType>>> {
      const matchingContent = content.filter((it) => Arrays.contains(references, it.reference))
      return matchingContent
    },
    async fetchContentByModel<Type extends ContentType>(type: Type): Promise<Array<ContentData<Type>>> {
      const matchingContent = content.filter((it) => it.type === type)
      return matchingContent as Array<ContentData<Type>>
    },
  }
}
