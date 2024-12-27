import { Referencable, ReferenceType } from '@bessemer/cornerstone/reference'
import { ContentModel, ContentReference, ContentType } from '@bessemer/cornerstone/content'
import { Objects, Preconditions, References } from '@bessemer/cornerstone'
import { ReactNode } from 'react'
import { GenericRecord } from '@bessemer/cornerstone/types'
import { CoreApplication } from '@bessemer/core/application'

export type CodexOptions = {
  label: CodexFunctions<{}>
  text: CodexFunctions<{}>
  definitions: Array<CodexDefinition<{}>>
}

export type CodexDefinitionResolver<T extends GenericRecord> = (
  reference: ReferenceType<ContentReference>,
  application: CoreApplication
) => Promise<T | undefined>

export type CodexDefinitionRenderer<T> = (data: T) => ReactNode

export type CodexFunctions<T extends GenericRecord> = {
  resolve: CodexDefinitionResolver<T>
  render: CodexDefinitionRenderer<T>
}

export type CodexDefinition<T extends GenericRecord> = ContentModel & CodexFunctions<T>

export type CodexLabel = Referencable<ContentReference> & {
  defaultValue?: ReactNode
}

export type CodexText = Referencable<ContentReference> & {
  defaultValue?: ReactNode
}

export const label = (reference: ReferenceType<ContentReference>, defaultValue?: ReactNode): CodexLabel => {
  return {
    reference: References.reference(reference, 'Content'),
    defaultValue,
  }
}

export const text = (reference: ReferenceType<ContentReference>, defaultValue?: ReactNode): CodexText => {
  return {
    reference: References.reference(reference, 'Content'),
    defaultValue,
  }
}

export const definition = <T extends GenericRecord>(
  type: ContentType,
  resolve: CodexDefinitionResolver<T>,
  render: CodexDefinitionRenderer<T>
): CodexDefinition<T> => {
  return {
    type,
    resolve,
    render,
  }
}

export const renderLabel = async (content: CodexLabel, application: CoreApplication): Promise<ReactNode> => {
  const data = await application.codex?.label.resolve(content.reference, application)
  if (Objects.isUndefined(data)) {
    return content.defaultValue
  }

  return application.codex?.label.render(data)
}

export const renderText = async (content: CodexLabel, application: CoreApplication): Promise<ReactNode> => {
  const data = await application.codex?.text.resolve(content.reference, application)
  if (Objects.isUndefined(data)) {
    return content.defaultValue
  }

  return application.codex?.text.render(data)
}

export const renderCodex = async (
  reference: ReferenceType<ContentReference>,
  type: ContentType,
  application: CoreApplication
): Promise<ReactNode> => {
  const definition = application.codex?.definitions.find((it) => it.type === type)!
  Preconditions.isPresent(definition)

  const data = await definition.resolve(reference, application)
  if (Objects.isUndefined(data)) {
    // JOHN figure out what to do here
    throw new Error('Oh noes')
  }

  return definition.render(data)
}
