import { Objects, Zod } from '@bessemer/cornerstone'
import { ZodType } from 'zod/v4'
import { TaggedType } from '@bessemer/cornerstone/types'

export const boundsSchema = <T extends ZodType>(type: T) => {
  return Zod.tuple([type.nullable(), type.nullable()]).brand('Bounds')
}

export type Bounds<T> = TaggedType<[T | null, T | null], 'Bounds'>

export const bounds = <T>(bounds: [lower: T | null, upper?: T | null]): Bounds<T> => {
  if (Objects.isUndefined(bounds[1])) {
    return [bounds[0], null] as Bounds<T>
  }

  return bounds as Bounds<T>
}
