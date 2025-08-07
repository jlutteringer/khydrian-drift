import Zod, { ZodType } from 'zod'
import { TaggedType } from '@bessemer/cornerstone/types'
import { isUndefined } from '@bessemer/cornerstone/object'

// JOHN bounds are still a mess! what about finite bounds ???
export type Bounds<T> = TaggedType<[T | null, T | null], 'Bounds'>
export type BoundsInput<T> = [lower: T | null, upper?: T | null] | Bounds<T>

export const schema = <T>(type: ZodType<T>): ZodType<Bounds<T>> => {
  return Zod.tuple([type.nullable(), type.nullable()]) as any
}

export type NumericBounds = Bounds<number>
export const NumericSchema = schema(Zod.number())

export type FiniteBounds<T> = [T, T]
export type FiniteNumericBounds = FiniteBounds<number>

export const of = <T>(bounds: BoundsInput<T>): Bounds<T> => {
  if (isUndefined(bounds[1])) {
    return [bounds[0], null] as Bounds<T>
  }

  return bounds as Bounds<T>
}
