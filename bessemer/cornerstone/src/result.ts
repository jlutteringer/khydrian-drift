import { buildGenerator, Left, LeftImpl, Right, RightImpl } from '@bessemer/cornerstone/either'
import { Throwable } from '@bessemer/cornerstone/types'
import { isPromise } from '@bessemer/cornerstone/promise'
import { executeAsync } from '@bessemer/cornerstone/internal'

export type Success<SuccessType> = Omit<Right<SuccessType>, 'map' | 'mapLeft'> & {
  isSuccess: true
  getOrThrow: () => SuccessType
  map: <T>(mapper: (element: SuccessType) => T) => T extends Promise<infer U> ? Promise<Success<U>> : Success<T>
  mapLeft: () => Success<SuccessType>
  [Symbol.iterator](): Generator<Result<SuccessType, never>, SuccessType>
}

export type Failure<FailureType = unknown> = Omit<Left<FailureType>, 'map' | 'mapLeft'> & {
  isSuccess: false
  getOrThrow: () => never
  map: () => Failure<FailureType>
  mapLeft: <T>(mapper: (element: FailureType) => T) => T extends Promise<infer U> ? Promise<Failure<U>> : Failure<T>
  [Symbol.iterator](): Generator<Result<never, FailureType>, never>
}

export type Result<SuccessType, FailureType = unknown> = Failure<FailureType> | Success<SuccessType>

class SuccessImpl<SuccessType> extends RightImpl<SuccessType> implements Success<SuccessType> {
  public readonly isSuccess = true

  constructor(value: SuccessType) {
    super(value)
  }

  getOrThrow(): SuccessType {
    return this.value
  }

  override map = <T>(mapper: (element: SuccessType) => T): T extends Promise<infer U> ? Promise<Success<U>> : Success<T> => {
    const mappedValue = mapper(this.value)
    if (isPromise(mappedValue)) {
      return executeAsync(async () => success(await mappedValue)) as any
    } else {
      return success(mappedValue) as any
    }
  }

  override mapLeft = (): Success<SuccessType> => {
    return this
  };

  override [Symbol.iterator](): Generator<Result<SuccessType, never>, SuccessType> {
    return function* (this: Success<SuccessType>) {
      return this.value
    }.call(this)
  }
}

class FailureImpl<FailureType> extends LeftImpl<FailureType> implements Failure<FailureType> {
  public readonly isSuccess = false

  constructor(value: FailureType) {
    super(value)
  }

  getOrThrow(): never {
    throw this.value
  }

  override map = (): Failure<FailureType> => {
    return this
  }

  override mapLeft = <T>(mapper: (element: FailureType) => T): T extends Promise<infer U> ? Promise<Failure<U>> : Failure<T> => {
    const mappedValue = mapper(this.value)
    if (isPromise(mappedValue)) {
      return executeAsync(async () => failure(await mappedValue)) as any
    } else {
      return failure(mappedValue) as any
    }
  };

  override [Symbol.iterator](): Generator<Result<never, FailureType>, never> {
    return function* (this: Failure<FailureType>) {
      yield this as any
      throw new Error('Illegal State')
    }.call(this)
  }
}

export type AsyncResult<T, N = Throwable> = Promise<Result<T, N>>

export const success = <T>(value: T): Success<T> => {
  return new SuccessImpl<T>(value)
}

export function failure(): Failure<never>
export function failure<N>(failure: N): Failure<N>
export function failure(failure?: unknown): Failure {
  return new FailureImpl<unknown>(failure)
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

const generator = buildGenerator((it) => success(it) as Result<any, any>)

export function gen<TGen extends () => Generator<Result<any, any>>>(
  generatorFn: TGen
): TGen extends () => Generator<Result<any, infer L>, infer R> ? Result<R, L> : never
export function gen<TGen extends () => AsyncGenerator<Result<any, any>>>(
  generatorFn: TGen
): Promise<TGen extends () => AsyncGenerator<Result<any, infer L>, infer R> ? Result<R, L> : never>
export function gen<TGen extends () => Generator<Result<any, any>> | AsyncGenerator<Result<any, any>>>(
  generatorFn: TGen
): TGen extends () => Generator<Result<any, infer L>, infer R>
  ? Result<R, L>
  : TGen extends () => AsyncGenerator<Result<any, infer L>, infer R>
  ? Promise<Result<R, L>>
  : never {
  return generator(generatorFn)
}
