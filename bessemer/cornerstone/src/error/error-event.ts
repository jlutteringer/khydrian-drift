import { Dictionary, Throwable } from '@bessemer/cornerstone/types'
import { deepMerge, isNil, isObject, isPresent, RecordAttribute } from '@bessemer/cornerstone/object'
import Zod, { ZodType } from 'zod'
import { evaluate, LazyValue } from '@bessemer/cornerstone/lazy'
import { findInCausalChain as errorsFindInCausalChain, isError } from '@bessemer/cornerstone/error/error'
import { isPromise } from '@bessemer/cornerstone/promise'
import { applyNamespace, emptyNamespace, NamespacedKey, ResourceNamespace, splitNamespace } from '@bessemer/cornerstone/resource-key'
import { ErrorType, Forbidden, InvalidValue, Required, Unauthorized, Unhandled } from '@bessemer/cornerstone/error/error-type'
import { Result } from '@bessemer/cornerstone/result'

/*
  Represents a structured error event. The code can be mapped to a unique type of error while the
  message and attributes can provide contextual information about the error. Finally,
  an ErrorEvent could have multiple causes which get aggregated into a single parent error.
 */
export type ErrorCode = NamespacedKey<ErrorType>
export const ErrorCodeSchema = Zod.string().transform((it) => it as NamespacedKey<ErrorType>)

export const splitErrorCode = (code: ErrorCode): [ErrorType, ResourceNamespace] => {
  return splitNamespace(code)
}

export const getErrorCodeType = (code: ErrorCode): ErrorType => {
  const [errorType] = splitErrorCode(code)
  return errorType
}

export type ErrorCodeBuilder =
  | {
      code: ErrorCode
    }
  | { type: ErrorType; namespace?: ResourceNamespace }

export const buildErrorCode = (builder: ErrorCodeBuilder): ErrorCode => {
  if ('code' in builder) {
    return builder.code
  } else {
    return applyNamespace(builder.type, builder.namespace ?? emptyNamespace())
  }
}

export type ErrorAttribute<Type = unknown> = RecordAttribute<Type, 'ErrorAttribute'>
export const ErrorAttributeSchema: ZodType<ErrorAttribute, string> = Zod.string()

export const ErrorEventCauseSchema = Zod.object({
  code: ErrorCodeSchema,
  message: Zod.string(),
  attributes: Zod.record(Zod.string(), Zod.unknown()),
})

export type ErrorEventCause = Zod.infer<typeof ErrorEventCauseSchema>

export const Schema = Zod.object({
  message: Zod.string(),
  causes: Zod.array(ErrorEventCauseSchema),
  attributes: Zod.record(ErrorAttributeSchema, Zod.unknown()),
})

export type ErrorEvent = Zod.infer<typeof Schema>

export type ErrorEventCauseBuilder = ErrorCodeBuilder & {
  message: string
  attributes?: Dictionary<unknown>
}

export type ErrorEventBuilder = {
  attributes?: Record<ErrorAttribute, unknown>
} & (
  | {
      causes: Array<ErrorEventCauseBuilder>
      message: string
    }
  | (ErrorCodeBuilder & {
      message: string
    })
)

export type ErrorEventAugment = Partial<ErrorEventBuilder>

// An exception type that contains an ErrorEvent
export class ErrorEventException extends Error {
  readonly errorEvent: ErrorEvent

  constructor(errorEvent: ErrorEvent, cause?: unknown) {
    super(errorEvent.message ?? '', { cause })
    this.name = this.constructor.name
    this.errorEvent = errorEvent
  }
}

export const isErrorEvent = (throwable: Throwable): throwable is ErrorEvent => {
  if (!isObject(throwable)) {
    return false
  }

  const errorEvent = throwable as ErrorEvent
  return isPresent(errorEvent.message) && isPresent(errorEvent.attributes) && isPresent(errorEvent.causes)
}

export const isErrorEventException = (throwable: Throwable): throwable is ErrorEventException => {
  return throwable instanceof ErrorEventException
}

export const of = (builder: ErrorEventBuilder): ErrorEvent => {
  if ('causes' in builder) {
    return {
      causes: builder.causes.map((it) => {
        return {
          code: buildErrorCode(it),
          message: it.message,
          attributes: it.attributes ?? {},
        }
      }),
      message: builder.message,
      attributes: builder.attributes ?? {},
    }
  } else {
    return {
      causes: [
        {
          code: buildErrorCode(builder),
          message: builder.message,
          attributes: {},
        },
      ],
      message: builder.message,
      attributes: builder.attributes ?? {},
    }
  }
}

export const from = (throwable: Throwable): ErrorEvent => {
  if (isErrorEvent(throwable)) {
    return throwable
  }

  if (!isError(throwable)) {
    return unhandled()
  }

  const errorEventException = errorsFindInCausalChain(throwable, isErrorEventException) as ErrorEventException | undefined
  if (isNil(errorEventException)) {
    return unhandled()
  }

  return errorEventException.errorEvent
}

export function withPropagation<ReturnType>(runnable: () => ReturnType, attributes: LazyValue<Dictionary<unknown>>): ReturnType
export function withPropagation<ReturnType>(runnable: () => Promise<ReturnType>, attributes: LazyValue<Dictionary<unknown>>): Promise<ReturnType>
export function withPropagation<ReturnType>(
  runnable: () => ReturnType | Promise<ReturnType>,
  attributes: LazyValue<Dictionary<unknown>>
): ReturnType | Promise<ReturnType> {
  try {
    let result = runnable()
    if (isPromise(result)) {
      return result.then((it) => it).catch((it) => propagate(it, evaluate(attributes)))
    } else {
      return result
    }
  } catch (throwable: Throwable) {
    throw propagate(throwable, evaluate(attributes))
  }
}

export const propagate = (throwable: Throwable, attributes: Dictionary<unknown>): never => {
  if (isErrorEventException(throwable)) {
    // We just mutate the existing error event to avoid nested exceptions
    const errorEvent = throwable.errorEvent
    errorEvent.attributes = { ...errorEvent.attributes, ...attributes }
    throw throwable
  } else {
    const errorEvent = from(throwable)
    const contextualizedEvent = of({ ...errorEvent, attributes: { ...errorEvent.attributes, ...attributes } })
    throw new ErrorEventException(contextualizedEvent, throwable)
  }
}

export const ValueAttribute: ErrorAttribute = 'value'
export const RequestCorrelationIdAttribute: ErrorAttribute<string> = 'requestCorrelationId'
export const HttpStatusCodeAttribute: ErrorAttribute<number> = 'httpStatusCode'

export const unhandled = (builder?: ErrorEventAugment): ErrorEvent =>
  of(
    deepMerge(
      {
        type: Unhandled,
        message: 'An Unhandled Error has occurred.',
        attributes: { [HttpStatusCodeAttribute]: 500 },
      },
      builder
    )
  )

export const required = (builder?: ErrorEventAugment): ErrorEvent =>
  of(
    deepMerge(
      {
        type: Required,
        message: 'The resource is required.',
        attributes: { [HttpStatusCodeAttribute]: 404 },
      },
      builder
    )
  )

export const unauthorized = (builder?: ErrorEventAugment): ErrorEvent =>
  of(
    deepMerge(
      {
        type: Unauthorized,
        message: 'The requested Resource requires authentication.',
        attributes: { [HttpStatusCodeAttribute]: 401 },
      },
      builder
    )
  )

export const forbidden = (builder?: ErrorEventAugment): ErrorEvent =>
  of(
    deepMerge(
      {
        type: Forbidden,
        message: 'The requested Resource requires additional permissions to access.',
        attributes: { [HttpStatusCodeAttribute]: 403 },
      },
      builder
    )
  )

export const invalidValue = (value: unknown, builder?: ErrorEventAugment): ErrorEvent =>
  of(
    deepMerge(
      {
        type: InvalidValue,
        message: 'The format is invalid and cannot be processed.',
        attributes: { [HttpStatusCodeAttribute]: 400, [ValueAttribute]: value },
      },
      builder
    )
  )

export function assertPresent<T>(value: T, builder: LazyValue<ErrorEventAugment | undefined> = () => undefined): asserts value is NonNullable<T> {
  if (isNil(value)) {
    throw new ErrorEventException(required(evaluate(builder)))
  }
}

export function assertAuthorized(value: boolean, builder: LazyValue<ErrorEventAugment | undefined> = () => undefined): asserts value is true {
  if (!value) {
    throw new ErrorEventException(unauthorized(evaluate(builder)))
  }
}

export function assertPermitted(value: boolean, builder: LazyValue<ErrorEventAugment | undefined> = () => undefined): asserts value is true {
  if (!value) {
    throw new ErrorEventException(forbidden(evaluate(builder)))
  }
}

export function assertValid(
  valid: boolean,
  value: unknown,
  builder: LazyValue<ErrorEventAugment | undefined> = () => undefined
): asserts value is true {
  if (!valid) {
    throw new ErrorEventException(invalidValue(value, evaluate(builder)))
  }
}

export function assert(value: boolean, builder: LazyValue<ErrorEventBuilder>): asserts value is true {
  if (!value) {
    throw new ErrorEventException(of(evaluate(builder)))
  }
}

export const unpackResult = <T>(result: Result<T, ErrorEvent>): T => {
  if (!result.isSuccess) {
    throw new ErrorEventException(result.value)
  }

  return result.value
}
