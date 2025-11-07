import { isPromise } from '@bessemer/cornerstone/promise'

export enum EitherType {
  Left = 'Left',
  Right = 'Right',
}

export type Right<RightType> = {
  type: EitherType.Right
  value: RightType
  isRight: true
  isLeft: false
  map: <T>(mapper: (element: RightType) => T) => Right<T>
  mapLeft: () => Right<RightType>
  [Symbol.iterator](): Generator<Either<RightType, never>, RightType>
}

export type Left<LeftType> = {
  type: EitherType.Left
  value: LeftType
  isRight: false
  isLeft: true
  map: () => Left<LeftType>
  mapLeft: <T>(mapper: (element: LeftType) => T) => Left<T>
  [Symbol.iterator](): Generator<Either<never, LeftType>, never>
}

export type Either<RightType, LeftType> = Left<LeftType> | Right<RightType>

export class RightImpl<RightType> implements Right<RightType> {
  public readonly type: EitherType.Right = EitherType.Right
  public readonly isRight = true
  public readonly isLeft = false

  constructor(public readonly value: RightType) {}

  map = <T>(mapper: (element: RightType) => T): Right<T> => {
    return right(mapper(this.value))
  }

  mapLeft = (): Right<RightType> => {
    return this
  };

  [Symbol.iterator](): Generator<Either<RightType, never>, RightType> {
    return function* (this: Right<RightType>) {
      return this.value
    }.call(this)
  }
}

export class LeftImpl<LeftType> implements Left<LeftType> {
  public readonly type = EitherType.Left
  public readonly isRight = false
  public readonly isLeft = true

  constructor(public readonly value: LeftType) {}

  map = (): Left<LeftType> => {
    return this
  }

  mapLeft = <T>(mapper: (element: LeftType) => T): Left<T> => {
    return left(mapper(this.value))
  };

  [Symbol.iterator](): Generator<Either<never, LeftType>, never> {
    return function* (this: Left<LeftType>) {
      yield this as any
      throw new Error('Illegal State')
    }.call(this)
  }
}

export const left = <LeftType>(value: LeftType): Left<LeftType> => new LeftImpl(value)
export const right = <RightType>(value: RightType): Right<RightType> => new RightImpl(value)

export const split = <RightType, LeftType>(array: Array<Either<RightType, LeftType>>): [Array<LeftType>, Array<RightType>] => {
  const lefts = array.filter((it) => it.isLeft).map((it) => it.value)
  const rights = array.filter((it) => it.isRight).map((it) => it.value)
  return [lefts, rights]
}

export const buildGenerator = <EitherType extends Either<any, any>, TGen extends () => Generator<EitherType> | AsyncGenerator<EitherType>>(
  lift: (val: any) => EitherType
): ((
  generatorFn: TGen
) => TGen extends () => Generator<EitherType, infer R>
  ? EitherType
  : TGen extends () => AsyncGenerator<EitherType, infer R>
  ? Promise<EitherType>
  : never) => {
  return (generatorFn) => {
    const generator = generatorFn()
    const firstNext = generator.next()
    if (isPromise(firstNext)) {
      return (async () => {
        let current = await firstNext
        while (!current.done) {
          const result = current.value
          if (result.isLeft) {
            return result
          }
          current = await generator.next(result.value)
        }
        return lift(current.value)
      })() as any
    } else {
      let current = firstNext
      while (!current.done) {
        const result = current.value
        if (result.isLeft) {
          return result
        }

        current = generator.next(result.value) as IteratorResult<EitherType>
      }

      return lift(current.value)
    }
  }
}

const generator = buildGenerator((it) => right(it) as Either<any, any>)

export function gen<TGen extends () => Generator<Either<any, any>>>(
  generatorFn: TGen
): TGen extends () => Generator<Either<any, infer L>, infer R> ? Either<R, L> : never
export function gen<TGen extends () => AsyncGenerator<Either<any, any>>>(
  generatorFn: TGen
): Promise<TGen extends () => AsyncGenerator<Either<any, infer L>, infer R> ? Either<R, L> : never>
export function gen<TGen extends () => Generator<Either<any, any>> | AsyncGenerator<Either<any, any>>>(
  generatorFn: TGen
): TGen extends () => Generator<Either<any, infer L>, infer R>
  ? Either<R, L>
  : TGen extends () => AsyncGenerator<Either<any, infer L>, infer R>
  ? Promise<Either<R, L>>
  : never {
  return generator(generatorFn)
}
