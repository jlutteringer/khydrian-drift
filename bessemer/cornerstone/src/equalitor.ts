import { Comparator } from '@bessemer/cornerstone/comparator'

export type Equalitor<T> = (first: T, second: T) => boolean

export const fromComparator = <T>(comparator: Comparator<T>): Equalitor<T> => {
  return (first, second) => comparator(first, second) === 0
}

export const reference =
  <T>(): Equalitor<T> =>
  (first, second) =>
    first === second
