import {
  difference as _difference,
  differenceBy as _differenceBy,
  differenceWith as _differenceWith,
  first as _first,
  isEmpty as _isEmpty,
  last as _last,
  range as _range,
  remove,
  uniq,
  uniqBy,
} from 'lodash-es'

export const difference = _difference
export const differenceBy = _differenceBy
export const differenceWith = _differenceWith
export const unique = uniq
export const uniqueBy = uniqBy
export const first = _first
export const last = _last
export const isEmpty = _isEmpty
// JOHN make a better range function
export const range = _range

export const rest = <T>(array: Array<T>, elementsToSkip: number = 1): Array<T> => {
  return array.slice(elementsToSkip)
}

export const clear = (array: Array<unknown>): void => {
  remove(array, () => true)
}

export const shallowEqual = (first: Array<unknown>, second: Array<unknown>): boolean => {
  if (first.length !== second.length) {
    return false
  }

  return first.every((element, index) => element === second[index])
}
