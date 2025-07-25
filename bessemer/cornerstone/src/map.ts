import { Entry } from '@bessemer/cornerstone/entry'
import { concatenate as arrayConcatenate } from '@bessemer/cornerstone/array'
import { assert, assertFalse, assertPresent } from '@bessemer/cornerstone/assertion'
import { sign, Signable, Signature } from '@bessemer/cornerstone/signature'
import { isPresent } from '@bessemer/cornerstone/object'

export const groupBy = <CollectionType, KeyType>(
  iterable: Iterable<CollectionType>,
  mapper: (it: CollectionType) => KeyType
): Map<KeyType, Array<CollectionType>> => {
  return collect(
    iterable,
    (it) => [mapper(it), [it]],
    (_, first, second) => arrayConcatenate(first, second)
  )
}

export const fuse = <KeyType, FuseType, ValueType>(target: Map<KeyType, FuseType>, valuesMap: Map<FuseType, ValueType>): Map<KeyType, ValueType> => {
  return mapValues(target, (value) => {
    const newValue = valuesMap.get(value)
    assertPresent(newValue, () => `Maps.fuse - Encountered missing linkage: ${value}`)
    return newValue
  })
}

export const mapKeys = <KeyType, ValueType, NewKeyType>(
  target: Map<KeyType, ValueType>,
  mapper: (key: KeyType) => NewKeyType
): Map<NewKeyType, ValueType> => {
  return map(target, ([key, value]) => [mapper(key), value])
}

export const mapValues = <KeyType, ValueType, NewValueType>(
  target: Map<KeyType, ValueType>,
  mapper: (value: ValueType) => NewValueType
): Map<KeyType, NewValueType> => {
  return map(target, ([key, value]) => [key, mapper(value)])
}

export const map = <KeyType, ValueType, NewKeyType, NewValueType>(
  target: Map<KeyType, ValueType>,
  mapper: (entry: Entry<KeyType, ValueType>) => Entry<NewKeyType, NewValueType>
): Map<NewKeyType, NewValueType> => {
  return collect(target.entries(), mapper, (key) => assert(() => `Maps.transform - Encountered illegal duplicate collection value: ${key}`))
}

export function collectKeys<CollectionType extends Signable>(iterable: Iterable<CollectionType>): Map<Signature, CollectionType>
export function collectKeys<CollectionType, KeyType>(
  iterable: Iterable<CollectionType>,
  mapper: (it: CollectionType) => KeyType
): Map<KeyType, CollectionType>
export function collectKeys<CollectionType, KeyType>(
  iterable: Iterable<CollectionType>,
  mapper?: (it: CollectionType) => KeyType
): Map<KeyType, CollectionType> {
  const reducer = (key: KeyType) => assert(() => `Maps.mapKeys - Encountered illegal duplicate collection value: ${key}`)

  if (isPresent(mapper)) {
    return collect(iterable, (it) => [mapper(it), it], reducer)
  } else {
    return collect(iterable, (it) => [sign(it as Signable) as KeyType, it], reducer)
  }
}

export const collectValues = <CollectionType, ValueType>(
  iterable: Iterable<CollectionType>,
  mapper: (it: CollectionType) => ValueType
): Map<CollectionType, ValueType> => {
  return collect(
    iterable,
    (it) => [it, mapper(it)],
    (key) => assert(() => `Maps.mapValues - Encountered illegal duplicate collection value: ${key}`)
  )
}

export const collect = <CollectionType, KeyType, ValueType>(
  iterable: Iterable<CollectionType>,
  mapEntry: (it: CollectionType) => Entry<KeyType, ValueType>,
  reducer: (key: KeyType, first: ValueType, second: ValueType) => ValueType
): Map<KeyType, ValueType> => {
  const result = new Map<KeyType, ValueType>()

  for (const item of iterable) {
    const [key, value] = mapEntry(item)

    if (result.has(key)) {
      const existingValue = result.get(key)!
      const reducedValue = reducer(key, existingValue, value)
      result.set(key, reducedValue)
    } else {
      result.set(key, value)
    }
  }

  return result
}

export const append = <KeyType, ValueType>(map: Map<KeyType, ValueType>, ...values: Array<Entry<KeyType, ValueType>>): Map<KeyType, ValueType> => {
  const result = new Map(map.entries())
  appendInto(result, ...values)
  return result
}

export const appendInto = <KeyType, ValueType>(map: Map<KeyType, ValueType>, ...values: Array<Entry<KeyType, ValueType>>): void => {
  for (const [key, value] of values) {
    assertFalse(map.has(key), () => `Maps.append - Encountered illegal duplicate key: ${key}`)
    map.set(key, value)
  }
}

export const concatenate = <KeyType, ValueType>(map: Map<KeyType, ValueType>, ...values: Array<Map<KeyType, ValueType>>): Map<KeyType, ValueType> => {
  const result = new Map(map)
  concatenateInto(result, ...values)
  return result
}

export const concatenateInto = <KeyType, ValueType>(map: Map<KeyType, ValueType>, ...values: Array<Map<KeyType, ValueType>>): void => {
  for (const otherMap of values) {
    for (const [key, value] of otherMap) {
      assertFalse(map.has(key), () => `Maps.concatenate - Encountered illegal duplicate key: ${key}`)
      map.set(key, value)
    }
  }
}

export const filter = <KeyType, ValueType>(
  map: Map<KeyType, ValueType>,
  predicate: (entry: Entry<KeyType, ValueType>) => boolean
): Map<KeyType, ValueType> => {
  const result = new Map(map)
  filterFrom(result, predicate)
  return result
}

export const filterFrom = <KeyType, ValueType>(map: Map<KeyType, ValueType>, predicate: (entry: Entry<KeyType, ValueType>) => boolean): void => {
  for (const entry of map) {
    if (!predicate(entry)) {
      map.delete(entry[0])
    }
  }
}
