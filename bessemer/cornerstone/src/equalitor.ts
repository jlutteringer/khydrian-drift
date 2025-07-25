import { Comparator } from '@bessemer/cornerstone/comparator'

export type Equalitor<T> = (first: T, second: T) => boolean

export const fromComparator = <T>(comparator: Comparator<T>): Equalitor<T> => {
  return (first, second) => comparator(first, second) === 0
}

export const natural =
  <T>(): Equalitor<T> =>
  (first, second) =>
    first === second

export const equalBy = <T, N>(mapper: (element: T) => N, equalitor: Equalitor<N>): Equalitor<T> => {
  return (first, second) => equalitor(mapper(first), mapper(second))
}
