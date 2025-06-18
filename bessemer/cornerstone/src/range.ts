import { Objects } from '@bessemer/cornerstone'
import Zod, { ZodType } from 'zod'
import { TaggedType } from '@bessemer/cornerstone/types'

export type Bounds<T> = TaggedType<[T | null, T | null], 'Bounds'>
export type BoundsInput<T> = [lower: T | null, upper?: T | null] | Bounds<T>

export const schema = <T extends ZodType>(type: T) => {
  return Zod.tuple([type.nullable(), type.nullable()])
}

export type NumericBounds<T> = Bounds<number>
export const NumericSchema = schema(Zod.number())

export const of = <T>(bounds: BoundsInput<T>): Bounds<T> => {
  if (Objects.isUndefined(bounds[1])) {
    return [bounds[0], null] as Bounds<T>
  }

  return bounds as Bounds<T>
}
