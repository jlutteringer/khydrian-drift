import { isPromise } from '@bessemer/cornerstone/promise'
import * as Eithers from '@bessemer/cornerstone/either'
import { Right } from '@bessemer/cornerstone/either'
import { assert } from '@bessemer/cornerstone/assertion'

export type Success<SuccessType> = SuccessType
export type Failure<FailureType = unknown> = Right<FailureType>
export type Result<SuccessType, FailureType = unknown> = Success<SuccessType> | Failure<FailureType>
export type AsyncResult<SuccessType, FailureType = unknown> = Promise<Result<SuccessType, FailureType>>

export const success = Eithers.left

export function failure(): Failure<never>
export function failure<N>(failure: N): Failure<N>
export function failure(failure?: unknown): Failure {
  return Eithers.right(failure)
}

export const isSuccess = Eithers.isLeft
export const isFailure = Eithers.isRight

export function assertSuccess<SuccessType, FailureType>(value: Result<SuccessType, FailureType>): asserts value is Success<SuccessType> {
  if (isFailure(value)) {
    throw value.value
  }
}
export function assertFailure<SuccessType, FailureType>(value: Result<SuccessType, FailureType>): asserts value is Failure<FailureType> {
  assert(isFailure(value))
}

export const map = Eithers.map
export const flatMap = Eithers.flatMap

export const mapFailure = Eithers.mapRight
export const flatMapFailure = Eithers.flatMapRight

export const split = Eithers.split

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

// const generator = buildGenerator((it) => success(it) as Result<any, any>)
//
// export function gen<TGen extends () => Generator<Result<any, any>>>(
//   generatorFn: TGen
// ): TGen extends () => Generator<Result<any, infer L>, infer R> ? Result<R, L> : never
// export function gen<TGen extends () => AsyncGenerator<Result<any, any>>>(
//   generatorFn: TGen
// ): Promise<TGen extends () => AsyncGenerator<Result<any, infer L>, infer R> ? Result<R, L> : never>
// export function gen<TGen extends () => Generator<Result<any, any>> | AsyncGenerator<Result<any, any>>>(
//   generatorFn: TGen
// ): TGen extends () => Generator<Result<any, infer L>, infer R>
//   ? Result<R, L>
//   : TGen extends () => AsyncGenerator<Result<any, infer L>, infer R>
//   ? Promise<Result<R, L>>
//   : never {
//   return generator(generatorFn)
// }
