import { DeepPartial, GenericRecord, NominalType } from '@bessemer/cornerstone/types'
import { Comparator } from '@bessemer/cornerstone/comparator'
import { Arrays, Comparators, Objects, Sets } from '@bessemer/cornerstone/index'

export type PropertyTagType = NominalType<string, 'PropertyTagType'>

export type PropertyTag = {
  type: PropertyTagType
  value: string
}

export const tag = (type: PropertyTagType, value: string): PropertyTag => {
  return {
    type,
    value,
  }
}

export type SerializedPropertyTags = NominalType<string, 'SerializedPropertyTags'>

export type PropertyRecord<T extends GenericRecord> = {
  values: T
  overrides: Record<SerializedPropertyTags, PropertyOverride<T>>
}

export type PropertyOverride<T extends GenericRecord> = {
  values: DeepPartial<T>
  tags: Array<PropertyTag>
}

export const tagComparator = (): Comparator<PropertyTag> => {
  return Comparators.aggregate([
    Comparators.compareBy((it) => it.type, Comparators.natural()),
    Comparators.compareBy((it) => it.value, Comparators.natural()),
  ])
}

export const serializeTags = (tags: Array<PropertyTag>): SerializedPropertyTags => {
  const serializedTags: SerializedPropertyTags = Arrays.sortWith(tags, tagComparator())
    .map(({ type, value }) => `${type}-${value}`)
    .join('.')

  return serializedTags
}

export const properties = <T extends GenericRecord>(values: T, overrides?: Array<PropertyOverride<T>>): PropertyRecord<T> => {
  const propertyOverrideEntries = (overrides ?? []).map((override) => {
    return [serializeTags(override.tags), override]
  })

  const propertyOverrides: Record<SerializedPropertyTags, PropertyOverride<T>> = Object.fromEntries(propertyOverrideEntries)

  return {
    values,
    overrides: propertyOverrides,
  }
}

export const resolve = <T extends GenericRecord>(properties: PropertyRecord<T>, tags: Array<PropertyTag>): T => {
  const overrides = Sets.properPowerSet(tags).map((tags) => {
    const serializedTags = serializeTags(tags)
    return properties.overrides[serializedTags]?.values ?? {}
  })

  return Objects.mergeAll([properties.values, ...overrides]) as T
}
