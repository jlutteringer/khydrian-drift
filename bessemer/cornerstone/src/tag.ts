import { TaggedType } from '@bessemer/cornerstone/types'
import { aggregate, Comparator, compareBy, natural } from '@bessemer/cornerstone/comparator'
import { Equalitor, fromComparator } from '@bessemer/cornerstone/equalitor'
import { equalWith, isEmpty, sortWith } from '@bessemer/cornerstone/array'
import { properPowerSet } from '@bessemer/cornerstone/set'

export type TagType<DataType> = TaggedType<string, ['TagType', DataType]>

export type Tag<DataType = unknown> = {
  type: TagType<DataType>
  value: DataType
}

export type TaggedValue<T> = {
  value: T
  tags: Array<Tag>
}

export const tag = <T>(type: TagType<T>, value: T): Tag<T> => {
  return {
    type,
    value,
  }
}

export const value = <T>(value: T, tags: Array<Tag>) => {
  return {
    value,
    tags: sortWith(tags, tagComparator()),
  }
}

export const tagComparator = <T>(): Comparator<Tag<T>> => {
  return aggregate([compareBy((it) => it.type, natural()), compareBy((it) => JSON.stringify(it.value), natural())])
}

export const tagEqualitor = <T>(): Equalitor<Tag<T>> => {
  return fromComparator(tagComparator())
}

export type SerializedTags = TaggedType<string, 'SerializedTags'>

export const serializeTags = <T>(tags: Array<Tag<T>>): SerializedTags => {
  const serializedTags: SerializedTags = sortWith(tags, tagComparator())
    .map(({ type, value }) => `${type}:${JSON.stringify(value)}`)
    .join('.')

  return serializedTags
}

export const resolve = <T>(values: Array<TaggedValue<T>>, tags: Array<Tag>): Array<TaggedValue<T>> => {
  return resolveBy(values, (it) => it.tags, tags)
}

export const resolveBy = <T>(values: Array<T>, mapper: (value: T) => Array<Tag>, tags: Array<Tag>): Array<T> => {
  const resolvedValues = properPowerSet(tags).flatMap((tags) => {
    return values.filter((it) => equalWith(mapper(it), tags, tagEqualitor()))
  })

  if (isEmpty(resolvedValues)) {
    const defaultValues = values.filter((it) => isEmpty(mapper(it)))
    return defaultValues
  }

  return resolvedValues.reverse()
}
