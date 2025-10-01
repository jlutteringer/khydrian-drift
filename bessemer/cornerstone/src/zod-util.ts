import Zod, { ZodType } from 'zod'
import { ResourceKey } from '@bessemer/cornerstone/resource-key'
import { parse as jsonParse } from '@bessemer/cornerstone/json'
import { failure, getValueOrThrow, Result, success } from '@bessemer/cornerstone/result'
import { ErrorEvent, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { $RefinementCtx } from 'zod/v4/core'
import * as Assertions from '@bessemer/cornerstone/assertion'

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

export type StructuredTransformer<InputType, OutputType> = (value: InputType) => Result<OutputType, ErrorEvent>

export const structuredTransform = <InputType, OutputType, SchemaType extends ZodType<InputType, InputType>>(
  schema: SchemaType,
  transformer: StructuredTransformer<InputType, OutputType>
) => {
  return schema.superRefine(refineResult(transformer)).transform((it) => {
    const result = transformer(it)
    return unpackResult(result)
  })
}

export const refineResult = <InputType>(
  transformer: StructuredTransformer<InputType, unknown>
): ((value: InputType, context: $RefinementCtx<InputType>) => void) => {
  return (value, context) => {
    const result = transformer(value)

    if (!result.isSuccess) {
      const error = result.value

      error.causes.forEach((cause) => {
        context.addIssue({
          code: 'custom',
          message: cause.message,
          input: value,
          error,
          cause,
        })
      })
    }
  }
}
