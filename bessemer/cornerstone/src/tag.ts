import { NominalType } from '@bessemer/cornerstone/types'
import { Comparator } from '@bessemer/cornerstone/comparator'
import { Arrays, Comparators, Equalitors, Sets } from '@bessemer/cornerstone'
import { Equalitor } from '@bessemer/cornerstone/equalitor'

export type TagType<DataType> = NominalType<string, ['TagType', DataType]>

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
    tags: Arrays.sortWith(tags, tagComparator()),
  }
}

export const tagComparator = <T>(): Comparator<Tag<T>> => {
  return Comparators.aggregate([
    Comparators.compareBy((it) => it.type, Comparators.natural()),
    Comparators.compareBy((it) => JSON.stringify(it.value), Comparators.natural()),
  ])
}

export const tagEqualitor = <T>(): Equalitor<Tag<T>> => {
  return Equalitors.fromComparator(tagComparator())
}

export type SerializedTags = NominalType<string, 'SerializedTags'>

export const serializeTags = <T>(tags: Array<Tag<T>>): SerializedTags => {
  const serializedTags: SerializedTags = Arrays.sortWith(tags, tagComparator())
    .map(({ type, value }) => `${type}-${JSON.stringify(value)}`)
    .join('.')

  return serializedTags
}

export const resolve = <T>(values: Array<TaggedValue<T>>, tags: Array<Tag>): Array<TaggedValue<T>> => {
  return resolveBy(values, (it) => it.tags, tags)
}

export const resolveBy = <T>(values: Array<T>, mapper: (value: T) => Array<Tag>, tags: Array<Tag>): Array<T> => {
  const resolvedValues = Sets.properPowerSet(tags).flatMap((tags) => {
    return values.filter((it) => Arrays.equalWith(mapper(it), tags, tagEqualitor()))
  })

  if (Arrays.isEmpty(resolvedValues)) {
    const defaultValues = values.filter((it) => Arrays.isEmpty(mapper(it)))
    return defaultValues
  }

  return resolvedValues.reverse()
}
