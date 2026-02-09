import { isObject } from '@bessemer/cornerstone/object'
import { assert } from '@bessemer/cornerstone/assertion'
import * as Promises from '@bessemer/cornerstone/promise'
import { Promisable } from 'type-fest'

const TypeToken = '__Either.type'

export enum EitherType {
  Left = 'Left',
  Right = 'Right',
}

declare const __types: unique symbol
export type NominalTyping2<NominalType> = { [__types]: NominalType }
export type NominalType2<ConcreteType, NominalType> = ConcreteType & NominalTyping2<NominalType>

export type Left<LeftType> = NominalType2<LeftType, 'Left'>
export type Right<RightType> = {
  [TypeToken]: EitherType.Right
  value: RightType
}
export type Either<LeftType, RightType> = Left<LeftType> | Right<RightType>

export const left = <LeftType>(value: LeftType): Left<LeftType> => value as Left<LeftType>
export const right = <RightType>(value: RightType): Right<RightType> => {
  return { [TypeToken]: EitherType.Right, value }
}

export const isLeft = <LeftType, RightType>(value: Either<LeftType, RightType>): value is Left<LeftType> => {
  return !isRight(value)
}
export const isRight = <LeftType, RightType>(value: Either<LeftType, RightType>): value is Right<RightType> => {
  return isObject(value) && (value as any)[TypeToken] === EitherType.Right
}

export function assertLeft<LeftType, RightType>(value: Either<LeftType, RightType>): asserts value is Left<LeftType> {
  assert(isLeft(value))
}
export function assertRight<LeftType, RightType>(value: Either<LeftType, RightType>): asserts value is Right<RightType> {
  assert(isRight(value))
}

export function map<LeftType, RightType, MappedType>(
  value: Either<LeftType, RightType>,
  mapper: (value: LeftType) => Promise<MappedType>
): Promise<Either<MappedType, RightType>>
export function map<LeftType, RightType, MappedType>(
  value: Either<LeftType, RightType>,
  mapper: (value: LeftType) => MappedType
): Either<MappedType, RightType>
export function map<LeftType, RightType, MappedType>(
  value: Either<LeftType, RightType>,
  mapper: (value: LeftType) => MappedType
): Promisable<Either<MappedType, RightType>> {
  if (isRight(value)) {
    return value
  }

  return Promises.map(mapper(value), left)
}

export function flatMap<LeftType, RightType, MappedLeftType, MappedRightType>(
  value: Either<LeftType, RightType>,
  mapper: (value: LeftType) => Promise<Either<MappedLeftType, MappedRightType>>
): Promise<Either<MappedLeftType, RightType | MappedRightType>>
export function flatMap<LeftType, RightType, MappedLeftType, MappedRightType>(
  value: Either<LeftType, RightType>,
  mapper: (value: LeftType) => Either<MappedLeftType, MappedRightType>
): Either<MappedLeftType, RightType | MappedRightType>
export function flatMap<LeftType, RightType, MappedLeftType, MappedRightType>(
  value: Either<LeftType, RightType>,
  mapper: (value: LeftType) => Either<MappedLeftType, MappedRightType>
): Promisable<Either<MappedLeftType, RightType | MappedRightType>> {
  if (isRight(value)) {
    return value
  }

  return mapper(value)
}

export function mapRight<LeftType, RightType, MappedType>(
  value: Either<LeftType, RightType>,
  mapper: (value: RightType) => Promise<MappedType>
): Promise<Either<LeftType, MappedType>>
export function mapRight<LeftType, RightType, MappedType>(
  value: Either<LeftType, RightType>,
  mapper: (value: RightType) => MappedType
): Either<LeftType, MappedType>
export function mapRight<LeftType, RightType, MappedType>(
  value: Either<LeftType, RightType>,
  mapper: (value: RightType) => MappedType
): Promisable<Either<LeftType, MappedType>> {
  if (isLeft(value)) {
    return value
  }

  return Promises.map(mapper(value.value), right)
}

export function flatMapRight<LeftType, RightType, MappedLeftType, MappedRightType>(
  value: Either<LeftType, RightType>,
  mapper: (value: RightType) => Promise<Either<MappedLeftType, MappedRightType>>
): Promise<Either<LeftType | MappedLeftType, MappedRightType>>
export function flatMapRight<LeftType, RightType, MappedLeftType, MappedRightType>(
  value: Either<LeftType, RightType>,
  mapper: (value: RightType) => Either<MappedLeftType, MappedRightType>
): Either<LeftType | MappedLeftType, MappedRightType>
export function flatMapRight<LeftType, RightType, MappedLeftType, MappedRightType>(
  value: Either<LeftType, RightType>,
  mapper: (value: RightType) => Either<MappedLeftType, MappedRightType>
): Promisable<Either<LeftType | MappedLeftType, MappedRightType>> {
  if (isLeft(value)) {
    return value
  }

  return mapper(value.value)
}

export const split = <LeftType, RightType>(array: Array<Either<LeftType, RightType>>): [Array<LeftType>, Array<RightType>] => {
  const lefts = array.filter((it) => isLeft(it)).map((it) => it)
  const rights = array.filter((it) => isRight(it)).map((it) => it.value)
  return [lefts, rights]
}

// export const buildGenerator = <EitherType extends Either<any, any>, TGen extends () => Generator<EitherType> | AsyncGenerator<EitherType>>(
//   lift: (val: any) => EitherType
// ): ((
//   generatorFn: TGen
// ) => TGen extends () => Generator<EitherType, infer R>
//   ? EitherType
//   : TGen extends () => AsyncGenerator<EitherType, infer R>
//   ? Promise<EitherType>
//   : never) => {
//   return (generatorFn) => {
//     const generator = generatorFn()
//     const firstNext = generator.next()
//     if (isPromise(firstNext)) {
//       return (async () => {
//         let current = await firstNext
//         while (!current.done) {
//           const result = current.value
//           if (result.isLeft) {
//             return result
//           }
//           current = await generator.next(result.value)
//         }
//         return lift(current.value)
//       })() as any
//     } else {
//       let current = firstNext
//       while (!current.done) {
//         const result = current.value
//         if (result.isLeft) {
//           return result
//         }
//
//         current = generator.next(result.value) as IteratorResult<EitherType>
//       }
//
//       return lift(current.value)
//     }
//   }
// }
//
// const generator = buildGenerator((it) => right(it) as Either<any, any>)
//
// export function gen<TGen extends () => Generator<Either<any, any>>>(
//   generatorFn: TGen
// ): TGen extends () => Generator<Either<any, infer L>, infer R> ? Either<R, L> : never
// export function gen<TGen extends () => AsyncGenerator<Either<any, any>>>(
//   generatorFn: TGen
// ): Promise<TGen extends () => AsyncGenerator<Either<any, infer L>, infer R> ? Either<R, L> : never>
// export function gen<TGen extends () => Generator<Either<any, any>> | AsyncGenerator<Either<any, any>>>(
//   generatorFn: TGen
// ): TGen extends () => Generator<Either<any, infer L>, infer R>
//   ? Either<R, L>
//   : TGen extends () => AsyncGenerator<Either<any, infer L>, infer R>
//   ? Promise<Either<R, L>>
//   : never {
//   return generator(generatorFn)
// }
