import { isPromise } from '@bessemer/cornerstone/promise'
import * as Eithers from '@bessemer/cornerstone/either'
import { Left, Right } from '@bessemer/cornerstone/either'
import { assert } from '@bessemer/cornerstone/assertion'
import { Promisable } from 'type-fest'

export type Success<SuccessType> = Left<SuccessType>
export type Failure<FailureType = unknown> = Right<FailureType>
export type Result<SuccessType, FailureType = unknown> = Success<SuccessType> | Failure<FailureType>
export type AsyncResult<SuccessType, FailureType = unknown> = Promise<Result<SuccessType, FailureType>>

export const success = <SuccessType>(value: SuccessType): Success<SuccessType> => Eithers.left(value)

export function failure(): Failure<never>
export function failure<N>(failure: N): Failure<N>
export function failure(failure?: unknown): Failure {
  return Eithers.right(failure)
}

export const isSuccess = <SuccessType, FailureType>(value: Result<SuccessType, FailureType>): value is Success<SuccessType> => {
  return Eithers.isLeft(value)
}
export const isFailure = <SuccessType, FailureType>(value: Result<SuccessType, FailureType>): value is Failure<FailureType> => {
  return Eithers.isRight(value)
}

export function assertSuccess<SuccessType, FailureType>(value: Result<SuccessType, FailureType>): asserts value is Success<SuccessType> {
  if (isFailure(value)) {
    throw value.value
  }
}
export function assertFailure<SuccessType, FailureType>(value: Result<SuccessType, FailureType>): asserts value is Failure<FailureType> {
  assert(isFailure(value))
}

export function map<SuccessType, FailureType, MappedType>(
  value: Result<SuccessType, FailureType>,
  mapper: (value: SuccessType) => Promise<MappedType>
): Promise<Result<MappedType, FailureType>>
export function map<SuccessType, FailureType, MappedType>(
  value: Result<SuccessType, FailureType>,
  mapper: (value: SuccessType) => MappedType
): Result<MappedType, FailureType>
export function map<SuccessType, FailureType, MappedType>(
  value: Result<SuccessType, FailureType>,
  mapper: (value: SuccessType) => MappedType
): Promisable<Result<MappedType, FailureType>> {
  return Eithers.map(value, mapper)
}

export function flatMap<SuccessType, FailureType, MappedSuccessType, MappedFailureType>(
  value: Result<SuccessType, FailureType>,
  mapper: (value: SuccessType) => Promise<Result<MappedSuccessType, MappedFailureType>>
): Promise<Result<MappedSuccessType, FailureType | MappedFailureType>>
export function flatMap<SuccessType, FailureType, MappedSuccessType, MappedFailureType>(
  value: Result<SuccessType, FailureType>,
  mapper: (value: SuccessType) => Result<MappedSuccessType, MappedFailureType>
): Result<MappedSuccessType, FailureType | MappedFailureType>
export function flatMap<SuccessType, FailureType, MappedSuccessType, MappedFailureType>(
  value: Result<SuccessType, FailureType>,
  mapper: (value: SuccessType) => Result<MappedSuccessType, MappedFailureType>
): Promisable<Result<MappedSuccessType, FailureType | MappedFailureType>> {
  return Eithers.flatMap(value, mapper)
}

export function mapFailure<SuccessType, FailureType, MappedType>(
  value: Result<SuccessType, FailureType>,
  mapper: (value: FailureType) => Promise<MappedType>
): Promise<Result<SuccessType, MappedType>>
export function mapFailure<SuccessType, FailureType, MappedType>(
  value: Result<SuccessType, FailureType>,
  mapper: (value: FailureType) => MappedType
): Result<SuccessType, MappedType>
export function mapFailure<SuccessType, FailureType, MappedType>(
  value: Result<SuccessType, FailureType>,
  mapper: (value: FailureType) => MappedType
): Promisable<Result<SuccessType, MappedType>> {
  return Eithers.mapRight(value, mapper)
}

export function flatMapFailure<SuccessType, FailureType, MappedSuccessType, MappedFailureType>(
  value: Result<SuccessType, FailureType>,
  mapper: (value: FailureType) => Promise<Result<MappedSuccessType, MappedFailureType>>
): Promise<Result<SuccessType | MappedSuccessType, MappedFailureType>>
export function flatMapFailure<SuccessType, FailureType, MappedSuccessType, MappedFailureType>(
  value: Result<SuccessType, FailureType>,
  mapper: (value: FailureType) => Result<MappedSuccessType, MappedFailureType>
): Result<SuccessType | MappedSuccessType, MappedFailureType>
export function flatMapFailure<SuccessType, FailureType, MappedSuccessType, MappedFailureType>(
  value: Result<SuccessType, FailureType>,
  mapper: (value: FailureType) => Result<MappedSuccessType, MappedFailureType>
): Promisable<Result<SuccessType | MappedSuccessType, MappedFailureType>> {
  return Eithers.flatMapRight(value, mapper)
}

export const split = <SuccessType, FailureType>(array: Array<Result<SuccessType, FailureType>>): [Array<SuccessType>, Array<FailureType>] => {
  return Eithers.split(array)
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
