import {
  differenceBy as _differenceBy,
  differenceWith as _differenceWith,
  first as _first,
  groupBy as _groupBy,
  isEmpty as _isEmpty,
  last as _last,
  range as _range,
  remove,
  uniqBy,
  uniqWith,
} from 'lodash-es'
import { Signable } from '@simulacrum/util/signature'
import { Signatures } from '@simulacrum/util/index'
import { Equalitor } from '@simulacrum/util/equalitor'

export const equalWith = <T>(first: Array<T>, second: Array<T>, equalitor: Equalitor<T>): boolean => {
  if (first.length !== second.length) {
    return false
  }

  return first.every((element, index) => equalitor(element, second[index]))
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

export const containsWith = <T>(array: Array<T>, element: T, equalitor: Equalitor<T>): boolean => {
  return array.some((it) => equalitor(it, element))
}

export const containsBy = <T>(array: Array<T>, element: T, mapper: (element: T) => Signable): boolean => {
  return containsWith(array, element, (first, second) => Signatures.sign(mapper(first)) === Signatures.sign(mapper(second)))
}

export const contains = <T extends Signable>(array: Array<T>, element: T): boolean => containsBy(array, element, Signatures.sign)

export const containsAllWith = <T>(first: Array<T>, second: Array<T>, equalitor: Equalitor<T>): boolean => isEmpty(differenceWith(second, first, equalitor))

export const containsAllBy = <T>(first: Array<T>, second: Array<T>, mapper: (element: T) => Signable): boolean => isEmpty(differenceBy(second, first, mapper))

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

export const first = _first
// JOHN validate that it is indeed the only...
export const only = first
export const last = _last
export const isEmpty = _isEmpty
// JOHN make a better range function
export const range = _range
// JOHN should this live in collections?
export const groupBy = _groupBy

export const rest = <T>(array: Array<T>, elementsToSkip: number = 1): Array<T> => {
  return array.slice(elementsToSkip)
}

export const clear = (array: Array<unknown>): void => {
  remove(array, () => true)
}
