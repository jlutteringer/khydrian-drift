import { Left, Right } from '@bessemer/cornerstone/either'
import { Eithers, Promises } from '@bessemer/cornerstone'
import { Throwable } from '@bessemer/cornerstone/types'

export type Success<T> = Right<T> & {
  isSuccess: true
}

export type Failure = Left<Throwable | null> & {
  isSuccess: false
}

export type Result<T> = Success<T> | Failure
export type AsyncResult<T> = Promise<Result<T>>

export const success = <T>(value: T): Success<T> => {
  return { ...Eithers.right(value), isSuccess: true }
}

export const failure = (failure?: Throwable): Failure => {
  return { ...Eithers.left(failure ?? null), isSuccess: false }
}

export function tryValue<SOURCE_VALUE>(resolver: () => Promise<SOURCE_VALUE>): AsyncResult<SOURCE_VALUE>
export function tryValue<SOURCE_VALUE>(resolver: () => SOURCE_VALUE): Result<SOURCE_VALUE>
export function tryValue<SOURCE_VALUE>(resolver: () => SOURCE_VALUE | Promise<SOURCE_VALUE>): Result<SOURCE_VALUE> | Promise<Result<SOURCE_VALUE>> {
  try {
    let result = resolver()
    if (Promises.isPromise(result)) {
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
    if (Promises.isPromise(result)) {
      return result.catch((it) => failure(it))
    } else {
      return result
    }
  } catch (e: any) {
    return failure(e)
  }
}

export function map<SOURCE_VALUE, TARGET_VALUE>(
  result: Result<SOURCE_VALUE>,
  valueMapper: (element: SOURCE_VALUE) => TARGET_VALUE
): Result<TARGET_VALUE> {
  if (result.isSuccess) {
    return {
      ...result,
      value: valueMapper(result.value),
    }
  } else {
    return result
  }
}
