import { NominalType } from '@bessemer/cornerstone/types'
import Zod from 'zod'
import { isPresent } from '@bessemer/cornerstone/object'

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

export const createNamespace = <T extends NamespaceKey>(value: T): ResourceNamespace<T> => {
  if (value === undefined) {
    return value as any as ResourceNamespace<T>
  }

  if (!/^[^\s\/][^\s\/]*(?:\/[^\s\/][^\s\/]*)*$/.test(value)) {
    throw new Error(`Unsupported Namespace format: ${value}`)
  }

  return value as ResourceNamespace<T>
}

export const createCompositeNamespace = (...names: Array<ResourceNamespace>): ResourceNamespace => {
  return names.filter(isPresent).join(ResourceNamespaceSeparator) as ResourceNamespace
}

export const ResourceNamespaceSchema = Zod.string().optional().transform(createNamespace)

export const namespaceKey = <KeyType extends ResourceKey = ResourceKey, NamespaceType extends NamespaceKey = NamespaceKey>(
  key: KeyType,
  namespace: ResourceNamespace<NamespaceType>
): NamespacedKey<KeyType, NamespaceType> => {
  if (namespace === undefined) {
    return encodeKey(key) as NamespacedKey<KeyType, NamespaceType>
  }

  return `${namespace}${ResourceNamespaceSeparator}${encodeKey(key)}` as NamespacedKey<KeyType, NamespaceType>
}

export const namespaceKeys = <KeyType extends ResourceKey = ResourceKey, NamespaceType extends NamespaceKey = NamespaceKey>(
  keys: Array<KeyType>,
  namespace: ResourceNamespace<NamespaceType>
): Array<NamespacedKey<KeyType, NamespaceType>> => {
  return keys.map((it) => namespaceKey(it, namespace))
}

export const destructureKey = <KeyType extends ResourceKey, NamespaceType extends NamespaceKey>(
  key: NamespacedKey<KeyType, NamespaceType>
): [KeyType, ResourceNamespace<NamespaceType>] => {
  const lastIndex = key.lastIndexOf(ResourceNamespaceSeparator)

  if (lastIndex !== -1) {
    const namespacePart = key.substring(0, lastIndex)
    const keyPart = key.substring(lastIndex + 1)

    return [decodeKey(keyPart) as KeyType, namespacePart as ResourceNamespace<NamespaceType>]
  } else {
    const keyPart = key
    return [decodeKey(keyPart) as KeyType, undefined as ResourceNamespace<NamespaceType>]
  }
}

export const getKey = <KeyType extends ResourceKey, NamespaceType extends NamespaceKey>(
  namespacedKey: NamespacedKey<KeyType, NamespaceType>
): KeyType => {
  const [key, _] = destructureKey(namespacedKey)
  return key
}

export const getNamespace = <KeyType extends ResourceKey, NamespaceType extends NamespaceKey>(
  namespacedKey: NamespacedKey<KeyType, NamespaceType>
): ResourceNamespace<NamespaceType> => {
  const [_, namespace] = destructureKey(namespacedKey)
  return namespace
}

export const extendNamespace = <KeyType extends ResourceKey, NamespaceType extends NamespaceKey>(
  namespacedKey: NamespacedKey<KeyType, NamespaceType>,
  additionalNamespace: ResourceNamespace
): NamespacedKey<KeyType> => {
  const [type, namespace] = destructureKey(namespacedKey)
  const extendedNamespace = createCompositeNamespace(additionalNamespace, namespace)
  return namespaceKey(type, extendedNamespace)
}

export const encodeKey = (key: ResourceKey): ResourceKey => {
  return key.replace(/%/g, '%25').replace(/\//g, '%2F')
}

export const decodeKey = (encodedKey: ResourceKey): ResourceKey => {
  return encodedKey.replace(/%2F/g, '/').replace(/%25/g, '%')
}
