import { TaggedType } from '@bessemer/cornerstone/types'
import Zod from 'zod'
import { removeStart } from '@bessemer/cornerstone/string'

export type ResourceKey = string

const ResourceNamespaceSeparator = '/'

export type ResourceNamespace = TaggedType<string, 'ResourceNamespace'>

export const namespace = (value: string): ResourceNamespace => {
  return value as ResourceNamespace
}

export const ResourceNamespaceSchema = Zod.string().transform(namespace)

export const applyNamespace = (name: ResourceNamespace, key: ResourceKey): ResourceKey => {
  return `${name}${ResourceNamespaceSeparator}${key}`
}

export const applyNamespaceAll = (name: ResourceNamespace, keys: Array<ResourceKey>): Array<ResourceKey> => {
  return keys.map((it) => applyNamespace(name, it))
}

export const stripNamespace = (name: ResourceNamespace, key: ResourceKey): ResourceKey => {
  return removeStart(key, `${name}${ResourceNamespaceSeparator}`)
}

export const stripNamespaceAll = (name: ResourceNamespace, keys: Array<ResourceKey>): Array<ResourceKey> => {
  return keys.map((it) => stripNamespace(name, it))
}

export const extendNamespace = (...names: Array<ResourceNamespace>): ResourceNamespace => {
  return namespace(names.join(ResourceNamespaceSeparator))
}
