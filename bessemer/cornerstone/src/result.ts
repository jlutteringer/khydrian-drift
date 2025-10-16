import * as Eithers from '@bessemer/cornerstone/either'
import { Left, Right } from '@bessemer/cornerstone/either'
import { Throwable } from '@bessemer/cornerstone/types'
import { isPromise } from '@bessemer/cornerstone/promise'

export type Success<T> = Right<T> & {
  isSuccess: true
}

export type Failure<N = Throwable> = Left<N> & {
  isSuccess: false
}

export type Result<T, N = Throwable> = Success<T> | Failure<N>

export type AsyncResult<T, N = Throwable> = Promise<Result<T, N>>

export const success = <T>(value: T): Success<T> => {
  return { ...Eithers.right(value), isSuccess: true }
}

export function failure(): Failure<never>
export function failure<N>(failure: N): Failure<N>
export function failure(failure?: unknown): Failure {
  return { ...Eithers.left(failure ?? null), isSuccess: false }
}

export const getValueOrThrow = <T>(result: Result<T>): T => {
  if (result.isSuccess) {
    return result.value
  } else {
    throw result.value
  }
}

export function tryValue<SOURCE_VALUE>(resolver: () => Promise<SOURCE_VALUE>): AsyncResult<SOURCE_VALUE>
export function tryValue<SOURCE_VALUE>(resolver: () => SOURCE_VALUE): Result<SOURCE_VALUE>
export function tryValue<SOURCE_VALUE>(resolver: () => SOURCE_VALUE | Promise<SOURCE_VALUE>): Result<SOURCE_VALUE> | Promise<Result<SOURCE_VALUE>> {
  try {
    let result = resolver()
    if (isPromise(result)) {
      return result.then((it) => success(it)).catch((it) => failure(it))
    } else {
      return success(result)
    }
  } catch (e: any) {
    return failure(e)
  }
}

export function tryResult<SOURCE_VALUE>(resolver: () => Result<SOURCE_VALUE>): Result<SOURCE_VALUE>
export function tryResult<SOURCE_VALUE>(resolver: () => AsyncResult<SOURCE_VALUE>): AsyncResult<SOURCE_VALUE>
export function tryResult<SOURCE_VALUE>(resolver: () => Result<SOURCE_VALUE> | AsyncResult<SOURCE_VALUE>): ReturnType<typeof resolver> {
  try {
    let result = resolver()
    if (isPromise(result)) {
      return result.catch((it) => failure(it))
    } else {
      return result
    }
  } catch (e: any) {
    return failure(e)
  }
}

export function mapResult<SourceType, TargetType, ErrorType>(
  result: Result<SourceType, ErrorType>,
  valueMapper: (element: SourceType) => TargetType
): Result<TargetType, ErrorType> {
  if (result.isSuccess) {
    return {
      ...result,
      value: valueMapper(result.value),
    }
  } else {
    return result
  }
}
