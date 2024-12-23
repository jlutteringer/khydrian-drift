import {
  concat,
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
import { Equalitor } from '@bessemer/cornerstone/equalitor'
import { Signable } from '@bessemer/cornerstone/signature'
import { Eithers, Signatures } from '@bessemer/cornerstone'
import { Either } from '@bessemer/cornerstone/either'

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

export const concatenate = concat

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

export const permute = <T>(values: Array<T>): Array<Array<T>> => {
  let result: Array<Array<T>> = []

  const permuteInternal = (arr: Array<T>, m: Array<T> = []) => {
    if (arr.length === 0) {
      result.push(m)
    } else {
      for (let i = 0; i < arr.length; i++) {
        let curr = arr.slice()
        let next = curr.splice(i, 1)
        permuteInternal(curr.slice(), m.concat(next))
      }
    }
  }

  permuteInternal(values)
  return result
}

export const cartesianProduct = <T>(...arrays: Array<Array<T>>): Array<Array<T>> => {
  return arrays.reduce<Array<Array<T>>>((acc, array) => acc.flatMap((product) => array.map((element) => [...product, element])), [[]])
}

export const bisect = <T, L, R>(array: Array<T>, bisector: (element: T, index: number) => Either<L, R>): [Array<L>, Array<R>] => {
  const bisected = array.map(bisector)
  const lefts = bisected.filter(Eithers.isLeft).map((it) => it.value)
  const rights = bisected.filter(Eithers.isRight).map((it) => it.value)
  return [lefts, rights]
}
