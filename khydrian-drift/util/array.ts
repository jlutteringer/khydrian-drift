import { difference as _difference, differenceBy as _differenceBy, differenceWith as _differenceWith, remove, uniq, uniqBy } from 'lodash-es'

export const difference = _difference
export const differenceBy = _differenceBy
export const differenceWith = _differenceWith
export const unique = uniq
export const uniqueBy = uniqBy

export const clear = (array: Array<unknown>): void => {
  remove(array, () => true)
}

export const shallowEqual = (first: Array<unknown>, second: Array<unknown>): boolean => {
  if (first.length !== second.length) {
    return false
  }

  return first.every((element, index) => element === second[index])
}
