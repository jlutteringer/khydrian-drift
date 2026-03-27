import { Entry } from '@bessemer/cornerstone/entry'
import { concatenate as arrayConcatenate } from '@bessemer/cornerstone/array'
import { assert, assertPresent } from '@bessemer/cornerstone/assertion'
import { Objects } from '@bessemer/cornerstone/index'
import { Dictionary } from '@bessemer/cornerstone/types'

/**
 * Creates a Map from a dictionary object (plain object with string keys).
 * Converts an object's key-value pairs into a Map structure.
 *
 * **Example**
 *
 * ```ts
 * import { Maps } from "@bessemer/cornerstone"
 *
 * const user = { name: "Alice", age: "30", role: "admin" }
 * const userMap = Maps.from(user)
 * console.log(userMap.get("name")) // "Alice"
 * console.log(userMap.size) // 3
 * ```
 *
 * @category constructors
 */
export const from = <ValueType>(record: Dictionary<ValueType>): Map<string, ValueType> => {
  return fromEntries(Object.entries(record))
}

/**
 * Creates a Map from an array of key-value pair entries.
 * Each entry is a tuple of [key, value] that will be added to the Map.
 *
 * **Example**
 *
 * ```ts
 * import { Maps } from "@bessemer/cornerstone"
 *
 * const entries: Array<[string, number]> = [["a", 1], ["b", 2], ["c", 3]]
 * const map = Maps.fromEntries(entries)
 * console.log(map.get("b")) // 2
 * console.log(map.size) // 3
 * ```
 *
 * @category constructors
 */
export const fromEntries = <KeyType extends string | number | symbol, ValueType>(
  entries: Array<Entry<KeyType, ValueType>>
): Map<KeyType, ValueType> => {
  return collect(entries, (it) => it)
}

/**
 * Groups elements of an iterable by a key extracted using a mapper function.
 * Returns a Map where each key maps to an array of all elements that share that key.
 *
 * **Example**
 *
 * ```ts
 * import { Maps } from "@bessemer/cornerstone"
 *
 * const users = [
 *   { name: "Alice", role: "admin" },
 *   { name: "Bob", role: "user" },
 *   { name: "Charlie", role: "admin" }
 * ]
 *
 * const byRole = Maps.groupBy(users, (user) => user.role)
 * console.log(byRole.get("admin")) // [{ name: "Alice", role: "admin" }, { name: "Charlie", role: "admin" }]
 * console.log(byRole.get("user")) // [{ name: "Bob", role: "user" }]
 * ```
 *
 * @category transformations
 */
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

/**
 * Fuses two maps together by using values from the first map as keys to lookup
 * values in the second map. The resulting map has the same keys as the target map,
 * but with values resolved through the valuesMap.
 *
 * **Example**
 *
 * ```ts
 * import { Maps } from "@bessemer/cornerstone"
 *
 * const userRoles = new Map([["user1", "roleA"], ["user2", "roleB"]])
 * const rolePermissions = new Map([["roleA", "read"], ["roleB", "write"]])
 *
 * const userPermissions = Maps.fuse(userRoles, rolePermissions)
 * console.log(userPermissions.get("user1")) // "read"
 * console.log(userPermissions.get("user2")) // "write"
 * ```
 *
 * @category transformations
 */
export const fuse = <KeyType, FuseType, ValueType>(target: Map<KeyType, FuseType>, valuesMap: Map<FuseType, ValueType>): Map<KeyType, ValueType> => {
  return mapValues(target, (value) => {
    const newValue = valuesMap.get(value)
    assertPresent(newValue, () => `Maps.fuse - Encountered missing linkage: ${value}`)
    return newValue
  })
}

/**
 * Transforms all keys in a map using a mapper function while preserving the values.
 * Returns a new map with transformed keys and the same values.
 *
 * **Example**
 *
 * ```ts
 * import { Maps } from "@bessemer/cornerstone"
 *
 * const map = new Map([[1, "one"], [2, "two"], [3, "three"]])
 * const stringKeyMap = Maps.mapKeys(map, (key) => `num_${key}`)
 * console.log(stringKeyMap.get("num_1")) // "one"
 * console.log(stringKeyMap.get("num_2")) // "two"
 * ```
 *
 * @category transformations
 */
export const mapKeys = <KeyType, ValueType, NewKeyType>(
  target: Map<KeyType, ValueType>,
  mapper: (key: KeyType) => NewKeyType
): Map<NewKeyType, ValueType> => {
  return map(target, ([key, value]) => [mapper(key), value])
}

/**
 * Transforms all values in a map using a mapper function while preserving the keys.
 * Returns a new map with the same keys and transformed values.
 *
 * **Example**
 *
 * ```ts
 * import { Maps } from "@bessemer/cornerstone"
 *
 * const prices = new Map([["apple", 1.5], ["banana", 0.8], ["orange", 1.2]])
 * const doubled = Maps.mapValues(prices, (price) => price * 2)
 * console.log(doubled.get("apple")) // 3.0
 * console.log(doubled.get("banana")) // 1.6
 * ```
 *
 * @category transformations
 */
export const mapValues = <KeyType, ValueType, NewValueType>(
  target: Map<KeyType, ValueType>,
  mapper: (value: ValueType) => NewValueType
): Map<KeyType, NewValueType> => {
  return map(target, ([key, value]) => [key, mapper(value)])
}

/**
 * Transforms both keys and values in a map using a mapper function.
 * Returns a new map with transformed entries. Throws an error if the mapper
 * produces duplicate keys.
 *
 * **Example**
 *
 * ```ts
 * import { Maps } from "@bessemer/cornerstone"
 *
 * const map = new Map([[1, "a"], [2, "b"], [3, "c"]])
 * const transformed = Maps.map(map, ([key, value]) => [key * 10, value.toUpperCase()])
 * console.log(transformed.get(10)) // "A"
 * console.log(transformed.get(20)) // "B"
 * ```
 *
 * @category transformations
 */
export const map = <KeyType, ValueType, NewKeyType, NewValueType>(
  target: Map<KeyType, ValueType>,
  mapper: (entry: Entry<KeyType, ValueType>) => Entry<NewKeyType, NewValueType>
): Map<NewKeyType, NewValueType> => {
  return collect(target.entries(), mapper, (key) => {
    throw new Error(`Maps.transform - Encountered illegal duplicate collection value: ${key}`)
  })
}

/**
 * Creates a map by extracting keys from collection items using a mapper function.
 * Each item becomes a value in the map, keyed by the result of the mapper.
 * Throws an error if the mapper produces duplicate keys.
 *
 * **Example**
 *
 * ```ts
 * import { Maps } from "@bessemer/cornerstone"
 *
 * const users = [
 *   { id: 1, name: "Alice" },
 *   { id: 2, name: "Bob" },
 *   { id: 3, name: "Charlie" }
 * ]
 *
 * const usersById = Maps.collectKeys(users, (user) => user.id)
 * console.log(usersById.get(1)) // { id: 1, name: "Alice" }
 * console.log(usersById.get(2)) // { id: 2, name: "Bob" }
 * ```
 *
 * @category constructors
 */
export const collectKeys = <CollectionType, KeyType>(
  iterable: Iterable<CollectionType>,
  mapper: (it: CollectionType) => KeyType
): Map<KeyType, CollectionType> => {
  return collect(
    iterable,
    (it) => [mapper(it), it],
    (key) => {
      throw new Error(`Maps.collectKeys - Encountered illegal duplicate collection value: ${key}`)
    }
  )
}

/**
 * Creates a map by extracting values from collection items using a mapper function.
 * Each item becomes a key in the map, with the mapped value as its value.
 * Throws an error if there are duplicate items in the collection.
 *
 * **Example**
 *
 * ```ts
 * import { Maps } from "@bessemer/cornerstone"
 *
 * const userIds = [1, 2, 3]
 * const userNames = Maps.collectValues(userIds, (id) => `User${id}`)
 * console.log(userNames.get(1)) // "User1"
 * console.log(userNames.get(2)) // "User2"
 * ```
 *
 * @category constructors
 */
export const collectValues = <CollectionType, ValueType>(
  iterable: Iterable<CollectionType>,
  mapper: (it: CollectionType) => ValueType
): Map<CollectionType, ValueType> => {
  return collect(
    iterable,
    (it) => [it, mapper(it)],
    (key) => {
      throw new Error(`Maps.mapValues - Encountered illegal duplicate collection value: ${key}`)
    }
  )
}

/**
 * Collects items from an iterable into a Map by transforming each item into a key-value entry.
 * Optionally accepts a reducer function to handle duplicate keys by combining their values.
 * Without a reducer, throws an error on duplicate keys.
 *
 * **Example**
 *
 * ```ts
 * import { Maps } from "@bessemer/cornerstone"
 *
 * const items = ["apple", "banana", "apricot"]
 * const byFirstLetter = Maps.collect(
 *   items,
 *   (item) => [item[0], item]
 * )
 * // throws error due to duplicate key 'a'
 *
 * const withReducer = Maps.collect(
 *   items,
 *   (item) => [item[0], [item]],
 *   (key, first, second) => [...first, ...second]
 * )
 * console.log(withReducer.get("a")) // ["apple", "apricot"]
 * console.log(withReducer.get("b")) // ["banana"]
 * ```
 *
 * @category constructors
 */
export function collect<CollectionType, KeyType, ValueType>(
  iterable: Iterable<CollectionType>,
  mapEntry: (it: CollectionType) => Entry<KeyType, ValueType>
): Map<KeyType, ValueType>
export function collect<CollectionType, KeyType, ValueType>(
  iterable: Iterable<CollectionType>,
  mapEntry: (it: CollectionType) => Entry<KeyType, ValueType>,
  reducer: (key: KeyType, first: ValueType, second: ValueType) => ValueType
): Map<KeyType, ValueType>
export function collect<CollectionType, KeyType, ValueType>(
  iterable: Iterable<CollectionType>,
  mapEntry: (it: CollectionType) => Entry<KeyType, ValueType>,
  reducer?: (key: KeyType, first: ValueType, second: ValueType) => ValueType
): Map<KeyType, ValueType> {
  const result = new Map<KeyType, ValueType>()

  for (const item of iterable) {
    const [key, value] = mapEntry(item)

    if (result.has(key)) {
      if (Objects.isNil(reducer)) {
        throw new Error(`Maps.collect - Encountered illegal duplicate collection key: ${key}`)
      }

      const existingValue = result.get(key)!
      const reducedValue = reducer(key, existingValue, value)
      result.set(key, reducedValue)
    } else {
      result.set(key, value)
    }
  }

  return result
}

/**
 * Creates a new map with additional entries appended. Throws an error if any
 * of the new entries have keys that already exist in the map.
 *
 * **Example**
 *
 * ```ts
 * import { Maps } from "@bessemer/cornerstone"
 *
 * const original = new Map([["a", 1], ["b", 2]])
 * const extended = Maps.append(original, ["c", 3], ["d", 4])
 * console.log(extended.get("c")) // 3
 * console.log(extended.size) // 4
 * console.log(original.size) // 2 (original unchanged)
 * ```
 *
 * @category mutations
 */
export const append = <KeyType, ValueType>(map: Map<KeyType, ValueType>, ...values: Array<Entry<KeyType, ValueType>>): Map<KeyType, ValueType> => {
  const result = new Map(map.entries())
  appendInto(result, ...values)
  return result
}

/**
 * Mutates a map by appending entries in place. Throws an error if any
 * of the new entries have keys that already exist in the map.
 *
 * **Example**
 *
 * ```ts
 * import { Maps } from "@bessemer/cornerstone"
 *
 * const map = new Map([["a", 1], ["b", 2]])
 * Maps.appendInto(map, ["c", 3], ["d", 4])
 * console.log(map.get("c")) // 3
 * console.log(map.size) // 4
 * ```
 *
 * @category mutations
 */
export const appendInto = <KeyType, ValueType>(map: Map<KeyType, ValueType>, ...values: Array<Entry<KeyType, ValueType>>): void => {
  for (const [key, value] of values) {
    assert(!map.has(key), () => `Maps.append - Encountered illegal duplicate key: ${key}`)
    map.set(key, value)
  }
}

/**
 * Creates a new map by concatenating multiple maps together. Throws an error
 * if any duplicate keys are encountered across the maps.
 *
 * **Example**
 *
 * ```ts
 * import { Maps } from "@bessemer/cornerstone"
 *
 * const map1 = new Map([["a", 1], ["b", 2]])
 * const map2 = new Map([["c", 3]])
 * const map3 = new Map([["d", 4]])
 *
 * const combined = Maps.concatenate(map1, map2, map3)
 * console.log(combined.size) // 4
 * console.log(combined.get("c")) // 3
 * ```
 *
 * @category mutations
 */
export const concatenate = <KeyType, ValueType>(map: Map<KeyType, ValueType>, ...values: Array<Map<KeyType, ValueType>>): Map<KeyType, ValueType> => {
  const result = new Map(map)
  concatenateInto(result, ...values)
  return result
}

/**
 * Mutates a map by concatenating other maps into it in place. Throws an error
 * if any duplicate keys are encountered.
 *
 * **Example**
 *
 * ```ts
 * import { Maps } from "@bessemer/cornerstone"
 *
 * const map1 = new Map([["a", 1], ["b", 2]])
 * const map2 = new Map([["c", 3]])
 *
 * Maps.concatenateInto(map1, map2)
 * console.log(map1.size) // 3
 * console.log(map1.get("c")) // 3
 * ```
 *
 * @category mutations
 */
export const concatenateInto = <KeyType, ValueType>(map: Map<KeyType, ValueType>, ...values: Array<Map<KeyType, ValueType>>): void => {
  for (const otherMap of values) {
    for (const [key, value] of otherMap) {
      assert(!map.has(key), () => `Maps.concatenate - Encountered illegal duplicate key: ${key}`)
      map.set(key, value)
    }
  }
}

/**
 * Creates a new map containing only entries that satisfy the predicate function.
 * Returns a filtered copy of the original map.
 *
 * **Example**
 *
 * ```ts
 * import { Maps } from "@bessemer/cornerstone"
 *
 * const prices = new Map([["apple", 1.5], ["banana", 0.5], ["orange", 2.0]])
 * const expensive = Maps.filter(prices, ([_, price]) => price > 1.0)
 * console.log(expensive.size) // 2
 * console.log(expensive.has("banana")) // false
 * console.log(expensive.get("apple")) // 1.5
 * ```
 *
 * @category filtering
 */
export const filter = <KeyType, ValueType>(
  map: Map<KeyType, ValueType>,
  predicate: (entry: Entry<KeyType, ValueType>) => boolean
): Map<KeyType, ValueType> => {
  const result = new Map(map)
  filterFrom(result, predicate)
  return result
}

/**
 * Mutates a map by removing entries that don't satisfy the predicate function.
 * Filters the map in place.
 *
 * **Example**
 *
 * ```ts
 * import { Maps } from "@bessemer/cornerstone"
 *
 * const prices = new Map([["apple", 1.5], ["banana", 0.5], ["orange", 2.0]])
 * Maps.filterFrom(prices, ([_, price]) => price > 1.0)
 * console.log(prices.size) // 2
 * console.log(prices.has("banana")) // false
 * ```
 *
 * @category filtering
 */
export const filterFrom = <KeyType, ValueType>(map: Map<KeyType, ValueType>, predicate: (entry: Entry<KeyType, ValueType>) => boolean): void => {
  for (const entry of map) {
    if (!predicate(entry)) {
      map.delete(entry[0])
    }
  }
}
