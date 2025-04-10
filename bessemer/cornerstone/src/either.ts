import { Eithers } from '@bessemer/cornerstone'

export enum EitherType {
  Left = 'Left',
  Right = 'Right',
}

export type Left<T> = {
  type: EitherType.Left
  value: T
}
export type Right<N> = {
  type: EitherType.Right
  value: N
}

export type Either<T, N> = Left<T> | Right<N>

export const left = <T>(value: T): Left<T> => ({ type: EitherType.Left, value })
export const right = <N>(value: N): Right<N> => ({ type: EitherType.Right, value })

export const isLeft = <T, N>(either: Either<T, N>): either is Left<T> => either.type === EitherType.Left
export const isRight = <T, N>(either: Either<T, N>): either is Right<N> => either.type === EitherType.Right

export const split = <L, R>(array: Array<Either<L, R>>): [Array<L>, Array<R>] => {
  const lefts = array.filter(Eithers.isLeft).map((it) => it.value)
  const rights = array.filter(Eithers.isRight).map((it) => it.value)
  return [lefts, rights]
}
