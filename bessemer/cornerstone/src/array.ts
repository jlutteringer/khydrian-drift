import {
  differenceBy as _differenceBy,
  differenceWith as _differenceWith,
  flatten as _flatten,
  groupBy as _groupBy,
  isEmpty as _isEmpty,
  range as _range,
  uniqBy,
  uniqWith,
} from 'lodash-es'
import { Equalitor } from '@bessemer/cornerstone/equalitor'
import { Signable } from '@bessemer/cornerstone/signature'
import { Assertions, Comparators, Eithers, Signatures } from '@bessemer/cornerstone'
import { Either } from '@bessemer/cornerstone/either'
import { Comparator } from '@bessemer/cornerstone/comparator'
import { Arrayable } from 'type-fest'

export const equalWith = <T>(first: Array<T>, second: Array<T>, equalitor: Equalitor<T>): boolean => {
  if (first.length !== second.length) {
    return false
  }

  return first.every((element, index) => equalitor(element, second[index]!))
}

export const equalBy = <T>(first: Array<T>, second: Array<T>, mapper: (element: T) => Signable): boolean => {
  return equalWith(first, second, (first, second) => Signatures.sign(mapper(first)) === Signatures.sign(mapper(second)))
}

export const equal = <T extends Signable>(first: Array<T>, second: Array<T>): boolean => {
  return equalBy(first, second, Signatures.sign)
}

export const differenceWith = <T>(first: Array<T>, second: Array<T>, equalitor: Equalitor<T>): Array<T> => {
  return _differenceWith(first, second, equalitor)
}

export const differenceBy = <T>(first: Array<T>, second: Array<T>, mapper: (element: T) => Signable): Array<T> => {
  return _differenceBy(first, second, (it) => Signatures.sign(mapper(it)))
}

export const difference = <T extends Signable>(first: Array<T>, second: Array<T>): Array<T> => {
  return differenceBy(first, second, Signatures.sign)
}

export const removeWith = <T>(array: Array<T>, element: T, equalitor: Equalitor<T>): Array<T> => {
  return differenceWith(array, [element], equalitor)
}

export const removeBy = <T>(array: Array<T>, element: T, mapper: (element: T) => Signable): Array<T> => {
  return differenceBy(array, [element], mapper)
}

export const remove = <T extends Signable>(array: Array<T>, element: T): Array<T> => {
  return difference(array, [element])
}

export const containsWith = <T>(array: Array<T>, element: T, equalitor: Equalitor<T>): boolean => {
  return array.some((it) => equalitor(it, element))
}

export const containsBy = <T>(array: Array<T>, element: T, mapper: (element: T) => Signable): boolean => {
  return containsWith(array, element, (first, second) => Signatures.sign(mapper(first)) === Signatures.sign(mapper(second)))
}

export const contains = <T extends Signable>(array: Array<T>, element: T): boolean => containsBy(array, element, Signatures.sign)

export const containsAllWith = <T>(first: Array<T>, second: Array<T>, equalitor: Equalitor<T>): boolean =>
  isEmpty(differenceWith(second, first, equalitor))

export const containsAllBy = <T>(first: Array<T>, second: Array<T>, mapper: (element: T) => Signable): boolean =>
  isEmpty(differenceBy(second, first, mapper))

export const containsAll = <T extends Signable>(first: Array<T>, second: Array<T>): boolean => isEmpty(difference(second, first))

export const dedupeWith = <T>(array: Array<T>, equalitor: Equalitor<T>): Array<T> => {
  return uniqWith(array, equalitor)
}

export const dedupeBy = <T>(array: Array<T>, mapper: (element: T) => Signable): Array<T> => {
  return uniqBy(array, (it) => Signatures.sign(mapper(it)))
}

export const dedupe = <T extends Signable>(array: Array<T>): Array<T> => {
  return dedupeBy(array, Signatures.sign)
}

export const sortWith = <T>(array: Array<T>, comparator: Comparator<T>): Array<T> => {
  return [...array].sort(comparator)
}

export const sortBy = <T>(array: Array<T>, mapper: (element: T) => Signable): Array<T> => {
  return sortWith(
    array,
    Comparators.compareBy((it) => Signatures.sign(mapper(it)), Comparators.natural())
  )
}

export const sort = <T extends Signable>(array: Array<T>): Array<T> => sortBy(array, Signatures.sign)

export const concatenate = <T>(array: Array<T> | null | undefined, ...values: Array<T | T[]>): Array<T> => {
  if (array == null) {
    return []
  }

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

export const first = <T>(array: Array<T> | null | undefined): T | undefined => {
  return array != null && array.length ? array[0] : undefined
}

export const only = <T>(array: Array<T>): T => {
  Assertions.assertTrue(array.length === 1)
  return first(array)!
}

export const last = <T>(array: Array<T> | null | undefined): T | undefined => {
  return array != null && array.length ? array[array.length - 1] : undefined
}

export const isEmpty = _isEmpty
// TODO make a better range function
export const range = _range
// TODO should this live in collections?
export const groupBy = _groupBy

export const rest = <T>(array: Array<T>, elementsToSkip: number = 1): Array<T> => {
  return array.slice(elementsToSkip)
}

export const filterInPlace = <T>(array: Array<T> | null | undefined, predicate: (value: T, index: number, array: Array<T>) => boolean): void => {
  if (array == null || !array.length) {
    return
  }

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

export const flatten = _flatten
