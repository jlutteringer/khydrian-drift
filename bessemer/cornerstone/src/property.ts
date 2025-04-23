import { Objects, Tags } from '@bessemer/cornerstone'
import { SerializedTags, Tag, TaggedValue } from '@bessemer/cornerstone/tag'
import { UnknownRecord } from 'type-fest'
import { DeepPartial } from '@bessemer/cornerstone/types'

export type PropertyRecord<T extends UnknownRecord> = {
  values: T
  overrides: Record<SerializedTags, PropertyOverride<T>>
}

export type PropertyOverride<T> = TaggedValue<DeepPartial<T>>

export const properties = <T extends UnknownRecord>(values: T, overrides?: Array<PropertyOverride<T>>): PropertyRecord<T> => {
  const propertyOverrideEntries = (overrides ?? []).map((override) => {
    return [Tags.serializeTags(override.tags), override]
  })

  const propertyOverrides: Record<SerializedTags, PropertyOverride<T>> = Object.fromEntries(propertyOverrideEntries)

  return {
    values,
    overrides: propertyOverrides,
  }
}

export const resolve = <T extends UnknownRecord>(properties: PropertyRecord<T>, tags: Array<Tag>): T => {
  const overrides = Tags.resolve(Object.values(properties.overrides), tags)
  return Objects.deepMergeAll([properties.values, ...overrides.reverse()]) as T
}
