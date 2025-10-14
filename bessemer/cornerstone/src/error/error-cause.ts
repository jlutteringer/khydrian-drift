import Zod, { ZodType } from 'zod'
import { ResourceNamespace } from '@bessemer/cornerstone/resource-key'
import { BadRequest, Forbidden, InvalidValue, Required, Unauthorized, Unhandled } from '@bessemer/cornerstone/error/error-type'
import { Dictionary } from '@bessemer/cornerstone/types'
import { deepMerge, RecordAttribute } from '@bessemer/cornerstone/object'
import * as ErrorCodes from '@bessemer/cornerstone/error/error-code'
import { ErrorCodeLike } from '@bessemer/cornerstone/error/error-code'

export type ErrorAttribute<Type = unknown> = RecordAttribute<Type, 'ErrorAttribute'>
export const ErrorAttributeSchema: ZodType<ErrorAttribute, string> = Zod.string()
export const ValueAttribute: ErrorAttribute = 'value'
export const RequestCorrelationIdAttribute: ErrorAttribute<string> = 'requestCorrelationId'
export const HttpStatusCodeAttribute: ErrorAttribute<number> = 'httpStatusCode'

const BaseErrorCauseSchema = Zod.object({
  code: ErrorCodes.Schema,
  message: Zod.string(),
  attributes: Zod.record(Zod.string(), Zod.unknown()),
})

export type ErrorCause = Zod.infer<typeof BaseErrorCauseSchema> & {
  causes: Array<ErrorCause>
}

export const Schema: ZodType<ErrorCause> = BaseErrorCauseSchema.extend({
  causes: Zod.lazy(() => Zod.array(Schema)),
})

export type ErrorCauseBuilder = {
  code: ErrorCodeLike
  message: string
  attributes?: Dictionary<unknown>
  causes?: Array<ErrorCauseBuilder>
}

export type ErrorCauseAugment = {
  namespace?: ResourceNamespace
  message?: string
  attributes?: Dictionary<unknown>
  causes?: Array<ErrorCauseBuilder>
}

export const from = (builder: ErrorCauseBuilder): ErrorCause => {
  const cause: ErrorCause = {
    code: ErrorCodes.from(builder.code),
    message: builder.message,
    attributes: builder.attributes ?? {},
    causes: builder.causes?.map(from) ?? [],
  }

  return cause
}

export const unhandled = (builder?: ErrorCauseAugment): ErrorCause =>
  from({
    code: ErrorCodes.from({ type: Unhandled, namespace: builder?.namespace }),
    ...deepMerge(
      {
        message: 'An Unhandled Error has occurred.',
        attributes: { [HttpStatusCodeAttribute]: 500 },
      },
      builder
    ),
  })

export const required = (builder?: ErrorCauseAugment): ErrorCause =>
  from({
    code: ErrorCodes.from({ type: Required, namespace: builder?.namespace }),
    ...deepMerge(
      {
        message: 'The resource is required.',
        attributes: { [HttpStatusCodeAttribute]: 404 },
      },
      builder
    ),
  })

export const unauthorized = (builder?: ErrorCauseAugment): ErrorCause =>
  from({
    code: ErrorCodes.from({ type: Unauthorized, namespace: builder?.namespace }),
    ...deepMerge(
      {
        message: 'The requested Resource requires authentication.',
        attributes: { [HttpStatusCodeAttribute]: 401 },
      },
      builder
    ),
  })

export const forbidden = (builder?: ErrorCauseAugment): ErrorCause =>
  from({
    code: ErrorCodes.from({ type: Forbidden, namespace: builder?.namespace }),
    ...deepMerge(
      {
        message: 'The requested Resource requires additional permissions to access.',
        attributes: { [HttpStatusCodeAttribute]: 403 },
      },
      builder
    ),
  })

export const badRequest = (builder?: ErrorCauseAugment): ErrorCause =>
  from({
    code: ErrorCodes.from({ type: BadRequest, namespace: builder?.namespace }),
    ...deepMerge(
      {
        message: 'The format is invalid and cannot be processed.',
        attributes: { [HttpStatusCodeAttribute]: 400 },
      },
      builder
    ),
  })

export const invalidValue = (value: unknown, builder?: ErrorCauseAugment): ErrorCause =>
  from({
    code: ErrorCodes.from({ type: InvalidValue, namespace: builder?.namespace }),
    ...deepMerge(
      {
        message: 'The format is invalid and cannot be processed.',
        attributes: { [HttpStatusCodeAttribute]: 400, [ValueAttribute]: value },
      },
      builder
    ),
  })
