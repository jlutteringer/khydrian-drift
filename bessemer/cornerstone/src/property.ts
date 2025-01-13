import { DeepPartial, GenericRecord } from '@bessemer/cornerstone/types'
import { Objects, Tags } from '@bessemer/cornerstone'
import { SerializedTags, Tag, TaggedValue } from '@bessemer/cornerstone/tag'

export type PropertyRecord<T extends GenericRecord> = {
  values: T
  overrides: Record<SerializedTags, PropertyOverride<T>>
}

export type PropertyOverride<T> = TaggedValue<DeepPartial<T>>

export const properties = <T extends GenericRecord>(values: T, overrides?: Array<PropertyOverride<T>>): PropertyRecord<T> => {
  const propertyOverrideEntries = (overrides ?? []).map((override) => {
    return [Tags.serializeTags(override.tags), override]
  })

  const propertyOverrides: Record<SerializedTags, PropertyOverride<T>> = Object.fromEntries(propertyOverrideEntries)

  return {
    values,
    overrides: propertyOverrides,
  }
}

export const resolve = <T extends GenericRecord>(properties: PropertyRecord<T>, tags: Array<Tag>): T => {
  const overrides = Tags.resolve(Object.values(properties.overrides), tags)
  return Objects.mergeAll([properties.values, ...overrides.reverse()]) as T
}
