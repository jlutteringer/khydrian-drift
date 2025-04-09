import Zod, { ZodType } from 'zod'
import { ResourceKey } from '@bessemer/cornerstone/resource'
import { Entry } from '@bessemer/cornerstone/entry'

export type infer<T extends ZodType<any, any, any>> = Zod.infer<T>
export const object = Zod.object
export const string = Zod.string
export const union = Zod.union
export const array = Zod.array
export const unknown = Zod.unknown
export const nullType = Zod.null
export const undefined = Zod.undefined
export const date = Zod.date
export const boolean = Zod.boolean
export const number = Zod.number
export const tuple = Zod.tuple

export const arrayable = <T>(type: ZodType<T>) => {
  return union([type, array(type)])
}

export const key = (): ZodType<ResourceKey> => {
  return string()
}

export const entry = <Value, Key = string>(value: ZodType<Value>, key?: ZodType<Key>): ZodType<Entry<Value, Key>> => {
  return tuple([key ?? string(), value]) as ZodType<Entry<Value, Key>>
}
