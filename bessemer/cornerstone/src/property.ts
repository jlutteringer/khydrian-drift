import { resolve as resolveTag, SerializedTags, serializeTags, Tag, TaggedValue } from '@bessemer/cornerstone/tag'
import { UnknownRecord } from 'type-fest'
import { DeepPartial } from '@bessemer/cornerstone/types'
import { deepMergeAll } from '@bessemer/cornerstone/object'

export type PropertyRecord<T extends UnknownRecord> = {
  values: T
  overrides: Record<SerializedTags, PropertyOverride<T>>
}

export type PropertyOverride<T> = TaggedValue<DeepPartial<T>>

export const properties = <T extends UnknownRecord>(values: T, overrides?: Array<PropertyOverride<T>>): PropertyRecord<T> => {
  const propertyOverrideEntries = (overrides ?? []).map((override) => {
    return [serializeTags(override.tags), override]
  })

  const propertyOverrides: Record<SerializedTags, PropertyOverride<T>> = Object.fromEntries(propertyOverrideEntries)

  return {
    values,
    overrides: propertyOverrides,
  }
}

export const resolve = <T extends UnknownRecord>(properties: PropertyRecord<T>, tags: Array<Tag>): T => {
  const overrides = resolveTag(Object.values(properties.overrides), tags)
  return deepMergeAll([properties.values, ...overrides.reverse()]) as T
}
