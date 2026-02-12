import Zod, { ZodError, ZodType } from 'zod'
import { ResourceKey } from '@bessemer/cornerstone/resource-key'
import { parse as jsonParse } from '@bessemer/cornerstone/json'
import * as Results from '@bessemer/cornerstone/result'
import { AsyncResult, Result } from '@bessemer/cornerstone/result'
import { ErrorEvent, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { $RefinementCtx } from 'zod/v4/core'

export const defaults = <T extends ZodType>(data: Zod.input<T>, schema: T): Zod.output<T> => {
  return schema.parse(data)
}

export const defaultsAsync = async <T extends ZodType>(data: Zod.input<T>, schema: T): Promise<Zod.output<T>> => {
  return schema.parseAsync(data)
}

export const parse = <T extends ZodType>(type: T, data: unknown): Result<Zod.infer<T>, ZodError<Zod.infer<T>>> => {
  const result = type.safeParse(data)
  if (result.success) {
    return Results.success(result.data)
  } else {
    return Results.failure(result.error)
  }
}

export const parseAsync = async <T extends ZodType>(type: T, data: unknown): AsyncResult<Zod.infer<T>, ZodError<Zod.infer<T>>> => {
  const result = await type.safeParseAsync(data)
  if (result.success) {
    return Results.success(result.data)
  } else {
    return Results.failure(result.error)
  }
}

export const parseJson = <T extends ZodType>(type: T, data: string): Result<Zod.infer<T>, SyntaxError | ZodError<Zod.infer<T>>> => {
  const result = jsonParse(data)
  if (Results.isFailure(result)) {
    return result
  }

  return parse(type, result)
}

export const parseJsonAsync = async <T extends ZodType>(type: T, data: string): AsyncResult<Zod.infer<T>, SyntaxError | ZodError<Zod.infer<T>>> => {
  const result = jsonParse(data)
  if (Results.isFailure(result)) {
    return result
  }

  return parseAsync(type, result)
}

export const parseJsonOrThrow = <T extends ZodType>(type: T, data: string): Zod.infer<T> => {
  const result = parseJson(type, data)
  Results.assertSuccess(result)
  return result
}

export const arrayable = <T>(type: ZodType<T>) => {
  return Zod.union([type, Zod.array(type)])
}

export const key = (): ZodType<ResourceKey> => {
  return Zod.string()
}

export type StructuredTransformer<InputType, OutputType> = (value: InputType) => Result<OutputType, ErrorEvent>

export const structuredTransform = <InputType, OutputType, SchemaType extends ZodType<InputType, InputType> = ZodType<InputType, InputType>>(
  schema: SchemaType,
  transformer: StructuredTransformer<InputType, OutputType>
) => {
  const refinedResultTransformer = refineResult(transformer)

  return schema.superRefine(refinedResultTransformer).transform((it) => {
    const result = transformer(it)
    return unpackResult(result)
  })
}

export const refineResult = <InputType, OutputType>(
  transformer: StructuredTransformer<InputType, OutputType>
): ((value: InputType, context: $RefinementCtx<InputType>) => void) => {
  return (value, context) => {
    const result = transformer(value)

    if (Results.isFailure(result)) {
      const error = result.value

      error.causes.forEach((cause) => {
        context.addIssue({
          code: 'custom',
          message: cause.message,
          input: value,
          context: error.context,
          cause,
        })
      })
    }
  }
}

export const unwrap = (schema: ZodType): ZodType => {
  const def = schema._zod.def

  if ('inner' in def && def.inner) {
    return unwrap(def.inner as ZodType)
  }
  if (def.type === 'pipe' && 'in' in def) {
    return unwrap((def as any).in as ZodType)
  }

  return schema
}

export enum ZodTypeKind {
  String = 'string',
  Number = 'number',
  Int = 'int',
  Boolean = 'boolean',
  Bigint = 'bigint',
  Symbol = 'symbol',
  Null = 'null',
  Undefined = 'undefined',
  Void = 'void',
  Never = 'never',
  Any = 'any',
  Unknown = 'unknown',
  Date = 'date',
  Object = 'object',
  Record = 'record',
  File = 'file',
  Array = 'array',
  Tuple = 'tuple',
  Union = 'union',
  Intersection = 'intersection',
  Map = 'map',
  Set = 'set',
  Enum = 'enum',
  Literal = 'literal',
  Nullable = 'nullable',
  Optional = 'optional',
  Nonoptional = 'nonoptional',
  Success = 'success',
  Transform = 'transform',
  Default = 'default',
  Prefault = 'prefault',
  Catch = 'catch',
  Nan = 'nan',
  Pipe = 'pipe',
  Readonly = 'readonly',
  TemplateLiteral = 'template_literal',
  Promise = 'promise',
  Lazy = 'lazy',
  Function = 'function',
  Custom = 'custom',
}

export const isType = (schema: ZodType, type: ZodTypeKind): boolean => {
  return unwrap(schema).type === type
}

export const isRequired = (schema: ZodType): boolean => {
  return !schema.safeParse(undefined).success
}
