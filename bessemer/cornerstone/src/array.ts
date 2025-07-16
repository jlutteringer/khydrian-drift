import { Equalitor } from '@bessemer/cornerstone/equalitor'
import { Signable, Signature } from '@bessemer/cornerstone/signature'
import { Assertions, Comparators, Eithers, Equalitors, Signatures } from '@bessemer/cornerstone'
import { Either } from '@bessemer/cornerstone/either'
import { Comparator } from '@bessemer/cornerstone/comparator'
import { Arrayable } from 'type-fest'
import { isNil } from '@bessemer/cornerstone/object'
import { FiniteNumericBounds } from '@bessemer/cornerstone/range'

export const equalWith = <T>(first: Array<T>, second: Array<T>, equalitor: Equalitor<T>): boolean => {
  if (first.length !== second.length) {
    return false
  }

  return first.every((element, index) => equalitor(element, second[index]!))
}

export function equalBy<T>(first: Array<T>, second: Array<T>, mapper: (element: T) => Signable): boolean
export function equalBy<T, N>(first: Array<T>, second: Array<T>, mapper: (element: T) => N, equalitor: Equalitor<N>): boolean
export function equalBy<T, N>(first: Array<T>, second: Array<T>, mapper: (element: T) => N, equalitor?: Equalitor<N>): boolean {
  if (isNil(equalitor)) {
    return equalWith(
      first,
      second,
      Equalitors.equalBy((it) => Signatures.sign(mapper(it) as Signable), Equalitors.natural())
    )
  } else {
    return equalWith(first, second, Equalitors.equalBy(mapper, equalitor))
  }
}

export const equal = <T extends Signable>(first: Array<T>, second: Array<T>): boolean => {
  return equalBy(first, second, Signatures.sign)
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
      Equalitors.equalBy((it) => Signatures.sign(mapper(it) as Signable), Equalitors.natural())
    )
  } else {
    return differenceWith(first, second, Equalitors.equalBy(mapper, equalitor))
  }
}

export const difference = <T extends Signable>(first: Array<T>, second: Array<T>): Array<T> => {
  return differenceBy(first, second, Signatures.sign)
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
      Equalitors.equalBy((it) => Signatures.sign(mapper(it) as Signable), Equalitors.natural())
    )
  } else {
    return containsWith(array, element, Equalitors.equalBy(mapper, equalitor))
  }
}

export const contains = <T extends Signable>(array: Array<T>, element: T): boolean => containsBy(array, element, Signatures.sign)

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
    return dedupeWith(array, Equalitors.equalBy(mapper as any, Equalitors.natural()))
  } else {
    return dedupeWith(array, Equalitors.equalBy(mapper, equalitor))
  }
}

export const dedupe = <T extends Signable>(array: Array<T>): Array<T> => {
  return dedupeBy(array, Signatures.sign)
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
      Comparators.compareBy((it) => Signatures.sign(mapper(it as any) as Signature), Comparators.natural())
    )
  } else {
    return sortWith(array, Comparators.compareBy(mapper, comparator))
  }
}

export const sort = <T extends Signable>(array: Array<T>): Array<T> => sortBy(array, Signatures.sign)

export const concatenate = <T>(array: Array<T>, ...values: Array<T | T[]>): Array<T> => {
  const result = [...array]

  if (values.length === 0) {
    return result
  }

  for (const value of values) {
    if (Array.isArray(value)) {
      result.push(...value)
    } else {
      result.push(value as T)
    }
  }

  return result
}

export const first = <T>(array: Array<T>): T | undefined => {
  return array.length > 0 ? array[0] : undefined
}

export const only = <T>(array: Array<T>): T => {
  Assertions.assertTrue(array.length === 1)
  return first(array)!
}

export const last = <T>(array: Array<T>): T | undefined => {
  return array.length > 0 ? array[array.length - 1] : undefined
}

export const isEmpty = <T>(array: Array<T>): boolean => {
  return array.length === 0
}

export const range = (bounds: FiniteNumericBounds): Array<number> => {
  const [start, end] = bounds
  // TODO maybe some other check?
  if (start > end) {
    return []
  }

  const result: number[] = []
  for (let i = start; i <= end; i++) {
    result.push(i)
  }
  return result
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

export const bisect = <T, L, R>(array: Array<T>, bisector: (element: T, index: number) => Either<L, R>): [Array<L>, Array<R>] => {
  return Eithers.split(array.map(bisector))
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
