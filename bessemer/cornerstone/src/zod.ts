import z, { ZodType } from 'zod'
import { ResourceKey } from '@bessemer/cornerstone/resource'
import { Entry } from '@bessemer/cornerstone/entry'

export type infer<T extends ZodType<any, any, any>> = z.infer<T>
export const object = z.object
export const string = z.string
export const union = z.union
export const array = z.array
export const unknown = z.unknown
export const nullType = z.null
export const undefined = z.undefined

export const arrayable = <T>(type: ZodType<T>) => {
  return z.union([type, z.array(type)])
}

export const key = (): ZodType<ResourceKey> => {
  return z.string()
}

export const entry = <Value, Key = string>(value: ZodType<Value>, key?: ZodType<Key>): ZodType<Entry<Value, Key>> => {
  return z.tuple([key ?? z.string(), value]) as ZodType<Entry<Value, Key>>
}
