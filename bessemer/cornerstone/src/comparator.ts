import { BasicType } from '@bessemer/cornerstone/types'
import { isString } from '@bessemer/cornerstone/string'
import { isNumber } from '@bessemer/cornerstone/math'
import { isDate } from '@bessemer/cornerstone/date'
import { isBoolean } from '@bessemer/cornerstone/object'

export type Comparator<T> = (first: T, second: T) => number

export const aggregate = <T>(comparators: Array<Comparator<T>>): Comparator<T> => {
  return (first, second) => {
    if (first === second) {
      return 0
    }

    for (const comparator of comparators) {
      const result = comparator(first, second)
      if (result !== 0) {
        return result
      }
    }

    return 0
  }
}

export const compareBy = <T, N>(mapper: (element: T) => N, comparator: Comparator<N>): Comparator<T> => {
  return (first, second) => comparator(mapper(first), mapper(second))
}

export const reverse = <T>(comparator: Comparator<T>): Comparator<T> => {
  return (first, second) => -comparator(first, second)
}

export const trueFirst = (): Comparator<boolean> => {
  return (first, second) => natural()(first ? 1 : 0, second ? 1 : 0)
}

export const natural = (): Comparator<BasicType | null> => {
  // Comparing by nulls first allows us to assume the elements are non-null for future comparisons
  return aggregate([
    nullsLast(),
    (first, second) => {
      if (isString(first) && isString(second)) {
        return first.localeCompare(second)
      } else if (isNumber(first) && isNumber(second)) {
        return first! - second!
      } else if (isDate(first) && isDate(second)) {
        return first.getTime() - second.getTime()
      } else if (isBoolean(first) && isBoolean(second)) {
        if (first !== second) {
          return second ? 1 : 0
        } else {
          return 0
        }
      }

      throw new Error(`Illegal natural comparison on values: [${first}, ${second}]`)
    },
  ])
}

export function matchedFirst<T>(target: T): Comparator<T | null> {
  return aggregate([
    nullsLast(),
    (first, second) => {
      if (first === target && second !== target) {
        return -1
      } else if (first !== target && second === target) {
        return 1
      } else {
        return 0
      }
    },
  ])
}

export const nullsLast = <T>(): Comparator<T> => {
  return (first, second) => {
    if (first === null) {
      return 1
    }
    if (second === null) {
      return -1
    }

    return 0
  }
}
