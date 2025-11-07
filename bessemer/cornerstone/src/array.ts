import { equalBy as equalitorEqualBy, Equalitor, natural as naturalEquality } from '@bessemer/cornerstone/equalitor'
import { sign, Signable, Signature } from '@bessemer/cornerstone/signature'
import { Either, split } from '@bessemer/cornerstone/either'
import { Comparator, compareBy, natural as naturalComparison } from '@bessemer/cornerstone/comparator'
import { Arrayable } from 'type-fest'
import { isNil } from '@bessemer/cornerstone/object'
import { FiniteNumericBounds } from '@bessemer/cornerstone/range'
import { assert } from '@bessemer/cornerstone/assertion'

export const makeBy = <T>(n: number, f: (i: number) => T): Array<T> => {
  const max = Math.max(1, Math.floor(n))
  const out = new Array(max)
  for (let i = 0; i < max; i++) {
    out[i] = f(i)
  }
  return out
}

export const range = ([start, end]: FiniteNumericBounds): Array<number> => {
  return start <= end ? makeBy(end - start + 1, (i) => start + i) : [start]
}

export const repeat = <T>(a: T, n: number): Array<T> => {
  return makeBy(n, () => a)
}

export const fromIterable = <A>(collection: Iterable<A>): Array<A> => {
  return Array.isArray(collection) ? collection : Array.from(collection)
}

export const take = <T>(array: Array<T>, elementsToSkip: number = 1): Array<T> => {
  return array.slice(elementsToSkip)
}

/**
 * Determines if two arrays are equal by comparing each element using an Equalitor.
 * Returns `true` if all corresponding elements are equal according to the provided
 * equalitor function in both arrays.
 *
 * **Example**
 *
 * ```ts
 * import { Arrays } from "@bessemer/cornerstone"
 *
 * const users1 = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]
 * const users2 = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]
 *
 * const result = Arrays.equalWith(users1, users2, (a, b) => a.id === b.id && a.name === b.name)
 * console.log(result) // true
 *
 * const numbers1 = [1.1, 2.2, 3.3]
 * const numbers2 = [1.0, 2.0, 3.0]
 *
 * const closeEnough = Arrays.equalWith(numbers1, numbers2, (a, b) => Math.abs(a - b) < 0.5)
 * console.log(closeEnough) // false
 * ```
 *
 * @category comparison
 */
export const equalWith = <T>(first: Array<T>, second: Array<T>, equalitor: Equalitor<T>): boolean => {
  if (first.length !== second.length) {
    return false
  }

  return first.every((element, index) => equalitor(element, second[index]!))
}

/**
 * Determines if two arrays are equal by comparing mapped values from each element.
 * Returns `true` if all corresponding mapped values are equal according to the
 * provided Equalitor or natural equality.
 *
 * **Example**
 *
 * ```ts
 * import { Arrays } from "@bessemer/cornerstone"
 *
 * const users1 = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]
 * const users2 = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]
 *
 * // Compare by mapped property using natural equality
 * const result = Arrays.equalBy(users1, users2, user => user.id)
 * console.log(result) // true
 *
 * // Compare by mapped property using custom Equalitor
 * const products1 = [{ name: "Apple", price: 1.99 }, { name: "Orange", price: 2.49 }]
 * const products2 = [{ name: "Apple", price: 2.00 }, { name: "Orange", price: 2.50 }]
 *
 * const closeEnough = Arrays.equalBy(
 *   products1,
 *   products2,
 *   product => product.price,
 *   (a, b) => Math.abs(a - b) < 0.1
 * )
 * console.log(closeEnough) // true
 * ```
 *
 * @category comparison
 */
export function equalBy<T>(first: Array<T>, second: Array<T>, mapper: (element: T) => Signable): boolean
export function equalBy<T, N>(first: Array<T>, second: Array<T>, mapper: (element: T) => N, equalitor: Equalitor<N>): boolean
export function equalBy<T, N>(first: Array<T>, second: Array<T>, mapper: (element: T) => N, equalitor?: Equalitor<N>): boolean {
  if (isNil(equalitor)) {
    return equalWith(
      first,
      second,
      equalitorEqualBy((it) => sign(mapper(it) as Signable), naturalEquality())
    )
  } else {
    return equalWith(first, second, equalitorEqualBy(mapper, equalitor))
  }
}

export const equal = <T extends Signable>(first: Array<T>, second: Array<T>): boolean => {
  return equalBy(first, second, sign)
}

export const differenceWith = <T>(first: Array<T>, second: Array<T>, equalitor: Equalitor<T>): Array<T> => {
  return first.filter((firstItem) => !second.some((it) => equalitor(firstItem, it)))
}

export function differenceBy<T>(first: Array<T>, second: Array<T>, mapper: (element: T) => Signable): Array<T>
export function differenceBy<T, N>(first: Array<T>, second: Array<T>, mapper: (element: T) => N, equalitor: Equalitor<N>): Array<T>
export function differenceBy<T, N>(first: Array<T>, second: Array<T>, mapper: (element: T) => N, equalitor?: Equalitor<N>): Array<T> {
  if (isNil(equalitor)) {
    return differenceWith(
      first,
      second,
      equalitorEqualBy((it) => sign(mapper(it) as Signable), naturalEquality())
    )
  } else {
    return differenceWith(first, second, equalitorEqualBy(mapper, equalitor))
  }
}

export const difference = <T extends Signable>(first: Array<T>, second: Array<T>): Array<T> => {
  return differenceBy(first, second, sign)
}

export const removeWith = <T>(array: Array<T>, element: T, equalitor: Equalitor<T>): Array<T> => {
  return differenceWith(array, [element], equalitor)
}

export function removeBy<T>(array: Array<T>, element: T, mapper: (element: T) => Signable): Array<T>
export function removeBy<T, N>(array: Array<T>, element: T, mapper: (element: T) => N, equalitor: Equalitor<N>): Array<T>
export function removeBy<T, N>(array: Array<T>, element: T, mapper: (element: T) => N, equalitor?: Equalitor<N>): Array<T> {
  return differenceBy(array, [element], mapper, equalitor as any)
}

export const remove = <T extends Signable>(array: Array<T>, element: T): Array<T> => {
  return difference(array, [element])
}

export const containsWith = <T>(array: Array<T>, element: T, equalitor: Equalitor<T>): boolean => {
  return array.some((it) => equalitor(it, element))
}

export function containsBy<T>(array: Array<T>, element: T, mapper: (element: T) => Signable): boolean
export function containsBy<T, N>(array: Array<T>, element: T, mapper: (element: T) => N, equalitor: Equalitor<N>): boolean
export function containsBy<T, N>(array: Array<T>, element: T, mapper: (element: T) => N, equalitor?: Equalitor<N>): boolean {
  if (isNil(equalitor)) {
    return containsWith(
      array,
      element,
      equalitorEqualBy((it) => sign(mapper(it) as Signable), naturalEquality())
    )
  } else {
    return containsWith(array, element, equalitorEqualBy(mapper, equalitor))
  }
}

export const contains = <T extends Signable>(array: Array<T>, element: T): boolean => containsBy(array, element, sign)

export const containsAllWith = <T>(first: Array<T>, second: Array<T>, equalitor: Equalitor<T>): boolean =>
  isEmpty(differenceWith(second, first, equalitor))

export function containsAllBy<T>(first: Array<T>, second: Array<T>, mapper: (element: T) => Signable): boolean
export function containsAllBy<T, N>(first: Array<T>, second: Array<T>, mapper: (element: T) => N, equalitor: Equalitor<N>): boolean
export function containsAllBy<T, N>(first: Array<T>, second: Array<T>, mapper: (element: T) => N, equalitor?: Equalitor<N>): boolean {
  return isEmpty(differenceBy(second, first, mapper, equalitor as any))
}

export const containsAll = <T extends Signable>(first: Array<T>, second: Array<T>): boolean => isEmpty(difference(second, first))

export const dedupeWith = <T>(array: Array<T>, equalitor: Equalitor<T>): Array<T> => {
  const result: Array<T> = []

  for (const element of array) {
    const isDuplicate = result.some((existing) => equalitor(existing, element))
    if (!isDuplicate) {
      result.push(element)
    }
  }

  return result
}

export function dedupeBy<T>(array: Array<T>, mapper: (element: T) => Signable): Array<T>
export function dedupeBy<T, N>(array: Array<T>, mapper: (element: T) => N, equalitor: Equalitor<N>): Array<T>
export function dedupeBy<T, N>(array: Array<T>, mapper: (element: T) => N, equalitor?: Equalitor<N>): Array<T> {
  if (isNil(equalitor)) {
    return dedupeWith(array, equalitorEqualBy(mapper as any, naturalEquality()))
  } else {
    return dedupeWith(array, equalitorEqualBy(mapper, equalitor))
  }
}

export const dedupe = <T extends Signable>(array: Array<T>): Array<T> => {
  return dedupeBy(array, sign)
}

export const sortWith = <T>(array: Array<T>, comparator: Comparator<T>): Array<T> => {
  return [...array].sort(comparator)
}

export function sortBy<T>(array: Array<T>, mapper: (element: T) => Signable): Array<T>
export function sortBy<T, N>(array: Array<T>, mapper: (element: T) => N, comparator: Comparator<N>): Array<T>
export function sortBy<T, N>(array: Array<T>, mapper: (element: T) => N, comparator?: Comparator<N>): Array<T> {
  if (isNil(comparator)) {
    return sortWith(
      array,
      compareBy((it) => sign(mapper(it as any) as Signature), naturalComparison())
    )
  } else {
    return sortWith(array, compareBy(mapper, comparator))
  }
}

export const sort = <T extends Signable>(array: Array<T>): Array<T> => sortBy(array, sign)

export const concatenate = <T>(array: Array<T>, ...values: Array<T | Array<T>>): Array<T> => {
  const result = [...array]

  for (const value of values) {
    if (Array.isArray(value)) {
      result.push(...value)
    } else {
      result.push(value)
    }
  }

  return result
}

export const first = <T>(array: Array<T>): T | undefined => {
  return array.length > 0 ? array[0] : undefined
}

export const only = <T>(array: Array<T>): T => {
  assert(array.length === 1)
  return first(array)!
}

export const last = <T>(array: Array<T>): T | undefined => {
  return array.length > 0 ? array[array.length - 1] : undefined
}

export const isEmpty = <T>(array: Array<T>): boolean => {
  return array.length === 0
}

// JOHN i don't think this function should exist here... maybe examine the use cases more thoroughly
export function groupBy<T, N extends string | number | symbol>(array: Array<T>, iteratee: (it: T) => N): Record<N, Array<T>> {
  return array.reduce<Record<N, Array<T>>>((result, value) => {
    const key = iteratee(value)

    if (!result[key]) {
      result[key] = []
    }

    result[key].push(value)
    return result
  }, {} as any)
}

export const rest = <T>(array: Array<T>, elementsToSkip: number = 1): Array<T> => {
  return array.slice(elementsToSkip)
}

export const filterInPlace = <T>(array: Array<T>, predicate: (value: T, index: number, array: Array<T>) => boolean): void => {
  for (let i = array.length - 1; i >= 0; i--) {
    const value = array[i]
    if (value !== undefined && !predicate(value, i, array)) {
      array.splice(i, 1)
    }
  }
}

export const clear = (array: Array<unknown>): void => {
  filterInPlace(array, () => false)
}

export const bisect = <T, RightType, LeftType>(
  array: Array<T>,
  bisector: (element: T, index: number) => Either<RightType, LeftType>
): [Array<LeftType>, Array<RightType>] => {
  return split(array.map(bisector))
}

export const toArray = <T>(array: Arrayable<T>): Array<T> => {
  if (Array.isArray(array)) {
    return array
  }

  return [array]
}

export const flatten = <T>(array: Array<Array<T>>): Array<T> => {
  return array.flatMap((it) => it)
}
