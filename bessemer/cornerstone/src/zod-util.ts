import Zod, { ZodType } from 'zod'
import { ResourceKey } from '@bessemer/cornerstone/resource'
import { parse as jsonParse } from '@bessemer/cornerstone/json'
import { failure, getValueOrThrow, Result, success } from '@bessemer/cornerstone/result'
import { Assertions } from '@bessemer/cornerstone/index'

export const parse = <T extends ZodType>(type: T, data: unknown): Result<Zod.infer<T>> => {
  const result = type.safeParse(data)
  if (result.success) {
    return success(result.data)
  } else {
    return failure(result.error)
  }
}

export const parseOrThrow = <T extends ZodType>(type: T, data: unknown): Zod.infer<T> => {
  return getValueOrThrow(parse(type, data))
}

export const parseJson = <T extends ZodType>(type: T, data: string): Result<Zod.infer<T>> => {
  const result = jsonParse(data)
  if (!result.isSuccess) {
    return result
  }

  return parse(type, result.value)
}

export const parseJsonOrThrow = <T extends ZodType>(type: T, data: string): Zod.infer<T> => {
  const result = parseJson(type, data)
  Assertions.assert(result.isSuccess)
  return result.value
}

export const arrayable = <T>(type: ZodType<T>) => {
  return Zod.union([type, Zod.array(type)])
}

export const key = (): ZodType<ResourceKey> => {
  return Zod.string()
}
