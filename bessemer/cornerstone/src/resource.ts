import { NominalType } from '@bessemer/cornerstone/types'
import { Strings } from '@bessemer/cornerstone/index'

export type ResourceKey = string
export type ResourceNamespace = NominalType<string, 'ResourceNamespace'>

export namespace ResourceKey {
  const ResourceKeySeparator = '--'

  export const namespace = (namespace: ResourceNamespace, key: ResourceKey): ResourceKey => {
    return `${namespace}${ResourceKeySeparator}${key}`
  }

  export const namespaceAll = (namespace: ResourceNamespace, keys: Array<ResourceKey>): Array<ResourceKey> => {
    return keys.map((it) => ResourceKey.namespace(namespace, it))
  }

  export const stripNamespace = (namespace: ResourceNamespace, key: ResourceKey): ResourceKey => {
    return Strings.removeStart(key, `${namespace}${ResourceKeySeparator}`)
  }

  export const stripNamespaceAll = (namespace: ResourceNamespace, keys: Array<ResourceKey>): Array<ResourceKey> => {
    return keys.map((it) => ResourceKey.stripNamespace(namespace, it))
  }

  export const extendNamespace = (...namespaces: Array<ResourceNamespace>): ResourceNamespace => {
    return namespaces.join(ResourceKeySeparator)
  }
}
