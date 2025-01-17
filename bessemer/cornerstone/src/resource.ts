import { NominalType } from '@bessemer/cornerstone/types'

// JOHN we may not want the Nominal Typing here...
export type ResourceKey = NominalType<string, 'ResourceKey'>

export namespace ResourceKey {
  const ResourceKeySeparator = '--'

  export const of = (values: Array<string>): ResourceKey => {
    return values.join(ResourceKeySeparator)
  }

  export const namespace = (key: ResourceKey, namespace: ResourceKey): ResourceKey => {
    return `${namespace}${ResourceKeySeparator}${key}`
  }
}
