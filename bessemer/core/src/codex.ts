import { Referencable, ReferenceType } from '@bessemer/cornerstone/reference'
import { Arrays, Assertions, Async, Entries, Objects, References, ResourceKeys } from '@bessemer/cornerstone'
import { ReactNode } from 'react'
import { CoreApplicationContext } from '@bessemer/core/application'
import {
  ContentData,
  ContentDisplayType,
  ContentKey,
  ContentProvider,
  ContentReference,
  ContentSector,
  ContentType,
  ContentTypeConstructor,
  TextContent,
  TextContentType,
} from '@bessemer/cornerstone/content'
import { Tag } from '@bessemer/cornerstone/tag'
import { Caches, Contexts } from '@bessemer/framework'
import { RecordEntry } from '@bessemer/cornerstone/entry'
import { NamespacedKey } from '@bessemer/cornerstone/resource-key'

export type CodexOptions = {
  provider: ContentProvider<any>
}

export type CodexRuntime = {
  renderers: Array<CodexRenderer<any>>
}

export type CodexRenderer<Content extends ContentData = ContentData> = {
  type: ContentTypeConstructor<Content>
  displayTypes: Array<ContentDisplayType>
  render: (content: Content) => ReactNode
}

export const defaultRuntime = (): CodexRuntime => {
  return {
    renderers: [],
  }
}

// export type CodexDefinitionResolver<T extends UnknownRecord> = (
//   reference: ReferenceType<ContentReference>,
//   application: CoreApplicationContext
// ) => Promise<T | undefined>
//
// export type CodexDefinitionRenderer<T> = (data: T) => ReactNode
//
// export type CodexFunctions<T extends UnknownRecord> = {
//   resolve: CodexDefinitionResolver<T>
//   render: CodexDefinitionRenderer<T>
// }

// export type CodexDefinition<T extends UnknownRecord> = CodexFunctions<T> & {
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

// export const definition = <T extends UnknownRecord>(
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
  Assertions.assertPresent(context.codex)
  const content = await context.codex.provider.fetchContentByIds([reference], context)
  if (Arrays.isEmpty(content)) {
    return undefined
  }

  Assertions.assert(content[0]?.type === TextContentType)
  return content[0] as TextContent
}

export const fetchTextByKey = async (key: ContentKey, context: CoreApplicationContext, tags: Array<Tag> = []): Promise<TextContent | null> =>
  fetchContentByKey(key, context, { type: TextContentType, tags: tags })

export const fetchTextByKeys = async (keys: Array<ContentKey>, context: CoreApplicationContext, tags: Array<Tag> = []): Promise<Array<TextContent>> =>
  fetchContentByKeys(keys, context, { type: TextContentType, tags: tags })

export type FetchContentOptions<Type extends ContentType> = { type?: Type; tags?: Array<Tag> }

export const fetchContentByKey = async <Type extends ContentType>(
  key: ContentKey,
  context: CoreApplicationContext,
  options?: FetchContentOptions<Type>
): Promise<ContentData<Type> | null> => {
  return Arrays.first(await fetchContentByKeys([key], context, options)) ?? null
}

const IndividualContentCacheKey = 'Codex.fetchContentByKeys'

// FUTURE lots of code duplication
export const fetchContentByKeys = async <Type extends ContentType>(
  keys: Array<ContentKey>,
  context: CoreApplicationContext,
  options?: FetchContentOptions<Type>
): Promise<Array<ContentData<Type>>> => {
  const cache = Caches.getCache<ContentData<Type>>('Codex.fetchContentByKeys', context)
  const namespace = Contexts.getNamespace(context)
  const namespacedKeys = ResourceKeys.applyNamespaceAll(keys, namespace)

  const results = await cache.fetchValues(namespacedKeys, async (keys) => {
    keys = keys.map((it) => ResourceKeys.getKey(it as NamespacedKey))
    Assertions.assertPresent(context.codex)

    const tags = Arrays.concatenate(Contexts.getTags(context), options?.tags ?? [])
    const content = await context.codex.provider.fetchContentByKeys(keys, tags, context)

    if (Objects.isPresent(options?.type)) {
      const illegalContent = content.find((it) => it.type !== options?.type)
      Assertions.assertNil(
        illegalContent,
        () => `ContentData: [${illegalContent?.key}] with type: [${illegalContent?.type}] did not match requested ContentType: ${options?.type}`
      )
    }

    const entries: Array<RecordEntry<ContentData<Type>>> = content.map((it) => {
      return [it.key, it as ContentData<Type>]
    })

    return entries
  })

  return Entries.values(results)
}

export const fetchContentBySector = async <Type extends ContentType>(
  sector: ContentSector,
  context: CoreApplicationContext,
  options?: FetchContentOptions<Type>
): Promise<Array<ContentData<Type>>> => {
  return await fetchContentBySectors([sector], context, options)
}

export const fetchContentBySectors = async <Type extends ContentType>(
  sectors: Array<ContentSector>,
  context: CoreApplicationContext,
  options?: FetchContentOptions<Type>
): Promise<Array<ContentData<Type>>> => {
  const cache = Caches.getCache<Array<ContentData<Type>>>('Codex.fetchContentBySectors', context)
  const namespace = Contexts.getNamespace(context)
  const keys = ResourceKeys.applyNamespaceAll(sectors, namespace)

  const results = await cache.fetchValues(keys, async (sectors) => {
    sectors = sectors.map((it) => ResourceKeys.getKey(it as NamespacedKey))
    Assertions.assertPresent(context.codex)

    const tags = Arrays.concatenate(Contexts.getTags(context), options?.tags ?? [])
    const genericContent = await context.codex.provider.fetchContentBySectors(sectors, tags, context)

    if (Objects.isPresent(options?.type)) {
      const illegalContent = genericContent.find((it) => it.type !== options?.type)
      Assertions.assertNil(
        illegalContent,
        () => `ContentData: [${illegalContent?.key}] with type: [${illegalContent?.type}] did not match requested ContentType: ${options?.type}`
      )
    }

    const content = genericContent as Array<ContentData<Type>>

    Async.execute(async () => {
      const entries: Array<RecordEntry<ContentData<Type>>> = content.map((it) => {
        return [ResourceKeys.applyNamespace(it.key, namespace), it]
      })

      await Caches.getCache<ContentData<Type>>(IndividualContentCacheKey, context).writeValues(entries)
    })

    // FUTURE this is wrong
    const entries: Array<RecordEntry<Array<ContentData<Type>>>> = Object.entries(Arrays.groupBy(content, (it) => it.sector ?? ''))
    return entries
  })

  return Arrays.flatten(Entries.values(results))
}
