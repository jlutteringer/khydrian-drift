import { NominalType } from '@bessemer/cornerstone/types'
import Zod from 'zod'
import { splitLast } from '@bessemer/cornerstone/string'
import { isPresent, isUndefined } from '@bessemer/cornerstone/object'

export type ResourceKey = string
const ResourceNamespaceSeparator = '/'

export type NamespaceKey = string | undefined
export type ResourceNamespace<NamespaceType extends NamespaceKey = NamespaceKey> = NominalType<NamespaceType, 'ResourceNamespace'> | undefined

export type NamespacedKey<KeyType extends ResourceKey = ResourceKey, NamespaceType extends NamespaceKey = NamespaceKey> = NominalType<
  string,
  ['NamespacedKey', KeyType, NamespaceType]
>

export const emptyNamespace = (): ResourceNamespace<undefined> => {
  return undefined
}

export const namespace = <T extends NamespaceKey>(value: T): ResourceNamespace<T> => {
  if (isUndefined(value)) {
    return value as any as ResourceNamespace<T>
  }

  if (!/^[^\s\/][^\s\/]*(?:\/[^\s\/][^\s\/]*)*$/.test(value)) {
    throw new Error(`Unsupported Namespace format: ${value}`)
  }

  return value as ResourceNamespace<T>
}

export const ResourceNamespaceSchema = Zod.string().optional().transform(namespace)

export const applyNamespace = <KeyType extends ResourceKey = ResourceKey, NamespaceType extends NamespaceKey = NamespaceKey>(
  key: KeyType,
  namespace: ResourceNamespace<NamespaceType>
): NamespacedKey<KeyType, NamespaceType> => {
  if (isUndefined(namespace)) {
    return encodeKey(key) as NamespacedKey<KeyType, NamespaceType>
  }
  return `${namespace}${ResourceNamespaceSeparator}${encodeKey(key)}` as NamespacedKey<KeyType, NamespaceType>
}

export const applyNamespaceAll = <KeyType extends ResourceKey = ResourceKey, NamespaceType extends NamespaceKey = NamespaceKey>(
  keys: Array<KeyType>,
  namespace: ResourceNamespace<NamespaceType>
): Array<NamespacedKey<KeyType, NamespaceType>> => {
  return keys.map((it) => applyNamespace(it, namespace))
}

export const splitNamespace = <KeyType extends ResourceKey, NamespaceType extends NamespaceKey>(
  key: NamespacedKey<KeyType, NamespaceType>
): [KeyType, ResourceNamespace<NamespaceType>] => {
  const { selection, rest } = splitLast(key, ResourceNamespaceSeparator)
  if (isPresent(selection)) {
    return [decodeKey(selection) as KeyType, rest as ResourceNamespace<NamespaceType>]
  } else {
    return [decodeKey(rest) as KeyType, undefined as ResourceNamespace<NamespaceType>]
  }
}

export const getKey = <KeyType extends ResourceKey, NamespaceType extends NamespaceKey>(
  namespacedKey: NamespacedKey<KeyType, NamespaceType>
): KeyType => {
  const [key, _] = splitNamespace(namespacedKey)
  return key
}

export const extendNamespace = (...names: Array<ResourceNamespace>): ResourceNamespace => {
  return names.join(ResourceNamespaceSeparator) as ResourceNamespace
}

export const encodeKey = (key: ResourceKey): ResourceKey => {
  return key.replace(/%/g, '%25').replace(/\//g, '%2F')
}

export const decodeKey = (encodedKey: ResourceKey): ResourceKey => {
  return encodedKey.replace(/%2F/g, '/').replace(/%25/g, '%')
}
