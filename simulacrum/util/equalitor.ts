import { Comparator } from '@simulacrum/util/comparator'

export type Equalitor<T> = (first: T, second: T) => boolean

export const fromComparator = <T>(comparator: Comparator<T>): Equalitor<T> => {
  return (first, second) => comparator(first, second) === 0
}

export const reference = (): Equalitor<any> => (first, second) => first === second
