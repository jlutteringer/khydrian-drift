import Zod, { ZodType } from 'zod'
import { ResourceKey } from '@bessemer/cornerstone/resource'
import { Entry } from '@bessemer/cornerstone/entry'
import { Json, Results } from '@bessemer/cornerstone'
import { Result } from '@bessemer/cornerstone/result'

export type infer<T extends ZodType<any, any, any>> = Zod.infer<T>
export type input<T extends ZodType<any, any, any>> = Zod.input<T>
export type output<T extends ZodType<any, any, any>> = Zod.output<T>
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
export const record = Zod.record
export const lazy = Zod.lazy

export const arrayable = <T>(type: ZodType<T>) => {
  return union([type, array(type)])
}

export const key = (): ZodType<ResourceKey> => {
  return string()
}

export const entry = <Value, Key = string>(value: ZodType<Value>, key?: ZodType<Key>): ZodType<Entry<Value, Key>> => {
  return tuple([key ?? string(), value]) as ZodType<Entry<Value, Key>>
}

export const parse = <T extends ZodType>(type: T, data: unknown): Result<Zod.infer<T>> => {
  const result = type.safeParse(data)
  if (result.success) {
    return Results.success(result.data)
  } else {
    return Results.failure(result.error)
  }
}

export const parseOrThrow = <T extends ZodType>(type: T, data: unknown): Zod.infer<T> => {
  return Results.getValueOrThrow(parse(type, data))
}

export const parseJson = <T extends ZodType>(type: T, data: string): Result<Zod.infer<T>> => {
  const result = Json.parse(data)
  if (!result.isSuccess) {
    return result
  }

  return parse(type, result.value)
}

export const parseJsonOrThrow = <T extends ZodType>(type: T, data: string): Zod.infer<T> => {
  return parseJson(type, data)
}
