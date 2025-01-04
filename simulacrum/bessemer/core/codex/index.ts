import { Referencable, ReferenceType } from '@bessemer/cornerstone/reference'
import { Arrays, Preconditions, References } from '@bessemer/cornerstone'
import { ReactNode } from 'react'
import { CoreApplicationContext } from '@bessemer/core/application'
import { ContentProvider, ContentReference, TextContent, TextContentType } from '@bessemer/cornerstone/content'

export type CodexOptions = {
  // JOHN better solution here?
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

export const fetchText = async (reference: ReferenceType<ContentReference>, context: CoreApplicationContext): Promise<TextContent | undefined> => {
  Preconditions.isPresent(context.codex)
  const content = await context.codex.provider.fetchContent([reference], context)
  if (Arrays.isEmpty(content)) {
    return undefined
  }

  Preconditions.isTrue(content[0]?.type === TextContentType)
  return content[0] as TextContent
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
//     // JOHN figure out what to do here
//     throw new Error('Oh noes')
//   }
//
//   return definition.render(data)
// }
