import { NominalType } from '@bessemer/cornerstone/types'
import { Strings } from '@bessemer/cornerstone'
import Zod, { ZodType } from 'zod'

export type ResourceKey = string

export type ResourceNamespace = NominalType<string, 'ResourceNamespace'>
export const ResourceNamespaceSchema: ZodType<ResourceNamespace> = Zod.string()

export namespace ResourceKey {
  const ResourceNamespaceSeparator = '/'

  export const namespace = (namespace: ResourceNamespace, key: ResourceKey): ResourceKey => {
    return `${namespace}${ResourceNamespaceSeparator}${key}`
  }

  export const namespaceAll = (namespace: ResourceNamespace, keys: Array<ResourceKey>): Array<ResourceKey> => {
    return keys.map((it) => ResourceKey.namespace(namespace, it))
  }

  export const stripNamespace = (namespace: ResourceNamespace, key: ResourceKey): ResourceKey => {
    return Strings.removeStart(key, `${namespace}${ResourceNamespaceSeparator}`)
  }

  export const stripNamespaceAll = (namespace: ResourceNamespace, keys: Array<ResourceKey>): Array<ResourceKey> => {
    return keys.map((it) => ResourceKey.stripNamespace(namespace, it))
  }

  export const extendNamespace = (...namespaces: Array<ResourceNamespace>): ResourceNamespace => {
    return namespaces.join(ResourceNamespaceSeparator)
  }
}
