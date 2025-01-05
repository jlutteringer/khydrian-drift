import { Referencable, ReferenceType } from '@bessemer/cornerstone/reference'
import { Arrays, Preconditions, References } from '@bessemer/cornerstone'
import { ReactNode } from 'react'
import { CoreApplicationContext } from '@bessemer/core/application'
import { ContentData, ContentKey, ContentProvider, ContentReference, ContentType, TextContent, TextContentType } from '@bessemer/cornerstone/content'
import { Tag } from '@bessemer/cornerstone/tag'
import { Contexts } from '@bessemer/framework'

export type CodexOptions = {
  provider: ContentProvider<any>
  // definitions: Array<CodexDefinition<{}>>
}

// export type CodexDefinitionResolver<T extends GenericRecord> = (
//   reference: ReferenceType<ContentReference>,
//   application: CoreApplicationContext
// ) => Promise<T | undefined>
//
// export type CodexDefinitionRenderer<T> = (data: T) => ReactNode
//
// export type CodexFunctions<T extends GenericRecord> = {
//   resolve: CodexDefinitionResolver<T>
//   render: CodexDefinitionRenderer<T>
// }

// export type CodexDefinition<T extends GenericRecord> = CodexFunctions<T> & {
//   type: ContentType
// }

// export type CodexLabel = Referencable<ContentReference> & {
//   defaultValue?: JSONContent
// }

export type CodexText = Referencable<ContentReference> & {
  defaultValue?: ReactNode
}

// export const label = (reference: ReferenceType<ContentReference>, defaultValue?: ReactNode): CodexLabel => {
//   return {
//     reference: References.reference(reference, 'Content'),
//     defaultValue,
//   }
// }

export const text = (reference: ReferenceType<ContentReference>, defaultValue?: ReactNode): CodexText => {
  return {
    reference: References.reference(reference, 'Content'),
    defaultValue,
  }
}

// export const definition = <T extends GenericRecord>(
//   type: ContentType,
//   resolve: CodexDefinitionResolver<T>,
//   render: CodexDefinitionRenderer<T>
// ): CodexDefinition<T> => {
//   return {
//     type,
//     resolve,
//     render,
//   }
// }

// export const renderLabel = async (content: CodexLabel, application: CoreApplicationContext): Promise<ReactNode> => {
//   const data = await application.codex?.label.resolve(content.reference, application)
//   if (Objects.isUndefined(data)) {
//     return content.defaultValue
//   }
//
//   return application.codex?.label.render(data)
// }

export const fetchTextById = async (
  reference: ReferenceType<ContentReference>,
  context: CoreApplicationContext
): Promise<TextContent | undefined> => {
  Preconditions.isPresent(context.codex)
  const content = await context.codex.provider.fetchContentByIds([reference], context)
  if (Arrays.isEmpty(content)) {
    return undefined
  }

  Preconditions.isTrue(content[0]?.type === TextContentType)
  return content[0] as TextContent
}

export const fetchTextByKey = async (
  key: ContentKey,
  context: CoreApplicationContext,
  additionalTags: Array<Tag> = []
): Promise<TextContent | undefined> => fetchTypedContentByKey(key, TextContentType, context, additionalTags)

export const fetchTextByKeys = async (
  keys: Array<ContentKey>,
  context: CoreApplicationContext,
  additionalTags: Array<Tag> = []
): Promise<Array<TextContent>> => fetchTypedContentByKeys(keys, TextContentType, context, additionalTags)

export const fetchTypedContentByKey = async <Type extends ContentType>(
  key: ContentKey,
  type: Type,
  context: CoreApplicationContext,
  additionalTags: Array<Tag> = []
): Promise<ContentData<Type> | undefined> => {
  return Arrays.first(await fetchTypedContentByKeys([key], type, context, additionalTags))
}

export const fetchTypedContentByKeys = async <Type extends ContentType>(
  keys: Array<ContentKey>,
  type: Type,
  context: CoreApplicationContext,
  additionalTags: Array<Tag> = []
): Promise<Array<ContentData<Type>>> => {
  const content = await fetchContentByKeys(keys, context, additionalTags)
  Preconditions.isTrue(content.every((it) => it.type === type))
  return content as Array<ContentData<Type>>
}

export const fetchContentByKey = async (
  key: ContentKey,
  context: CoreApplicationContext,
  additionalTags: Array<Tag> = []
): Promise<ContentData | undefined> => {
  return Arrays.first(await fetchContentByKeys([key], context, additionalTags))
}

export const fetchContentByKeys = async (
  keys: Array<ContentKey>,
  context: CoreApplicationContext,
  additionalTags: Array<Tag> = []
): Promise<Array<ContentData>> => {
  Preconditions.isPresent(context.codex)

  const tags = Arrays.concatenate(Contexts.getTags(context), additionalTags)
  const content = await context.codex.provider.fetchContentByKeys(keys, tags, context)
  return content
}

// export const renderCodex = async (
//   reference: ReferenceType<ContentReference>,
//   type: ContentType,
//   application: CoreApplicationContext
// ): Promise<ReactNode> => {
//   const definition = application.codex?.definitions.find((it) => it.type === type)!
//   Preconditions.isPresent(definition)
//
//   const data = await definition.resolve(reference, application)
//   if (Objects.isUndefined(data)) {
//     throw new Error('Oh noes')
//   }
//
//   return definition.render(data)
// }
