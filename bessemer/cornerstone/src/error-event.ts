import { Arrays, Errors, Objects, Promises } from '@bessemer/cornerstone'
import { Dictionary, NominalType, Throwable } from '@bessemer/cornerstone/types'
import { RecordAttribute } from '@bessemer/cornerstone/object'
import Zod, { ZodType } from 'zod'
import { evaluate, LazyValue } from '@bessemer/cornerstone/lazy'

/*
  Represents a structured error event. The code can be mapped to a unique type of error while the
  message and attributes can provide contextual information about the error. Finally,
  an ErrorEvent could have multiple causes which get aggregated into a single parent error.
 */
export type ErrorCode = NominalType<string, 'ErrorCode'>
export const ErrorCodeSchema: ZodType<ErrorCode> = Zod.string()

export type ErrorAttribute<Type = unknown> = RecordAttribute<Type, 'ErrorAttribute'>
export const ErrorAttributeSchema: ZodType<ErrorAttribute> = Zod.string()

const baseErrorEventSchema = Zod.object({
  code: ErrorCodeSchema,
  message: Zod.string(),
  attributes: Zod.record(ErrorAttributeSchema, Zod.unknown()),
})

export type ErrorEvent = Zod.infer<typeof baseErrorEventSchema> & {
  causes: Array<ErrorEvent>
}

const ErrorEventSchema: ZodType<ErrorEvent> = baseErrorEventSchema.extend({
  causes: Zod.lazy(() => Zod.array(ErrorEventSchema)),
})

// Builder object that allows for 'partial' representation of ErrorEvents
export type ErrorEventBuilder = {
  code: ErrorCode
  message?: string | null
  attributes?: Record<ErrorAttribute, unknown>
  causes?: Array<ErrorEvent>
}

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
  if (!Objects.isObject(throwable)) {
    return false
  }

  return 'code' in throwable && 'message' in throwable && 'attributes' in throwable && 'causes' in throwable
}

export const isErrorEventException = (throwable: Throwable): throwable is ErrorEventException => {
  return throwable instanceof ErrorEventException
}

export const of = (builder: ErrorEventBuilder): ErrorEvent => {
  const code = builder.code

  return {
    code,
    message: builder.message ?? code,
    attributes: builder.attributes ?? {},
    causes: builder.causes ?? [],
  }
}

export const from = (throwable: Throwable): ErrorEvent => {
  if (isErrorEvent(throwable)) {
    return throwable
  }

  if (!Errors.isError(throwable)) {
    return unhandled()
  }

  const errorEventException = Errors.findInCausalChain(throwable, isErrorEventException) as ErrorEventException | undefined
  if (Objects.isNil(errorEventException)) {
    return unhandled()
  }

  return errorEventException.errorEvent
}

export function withPropagation<ReturnType>(runnable: () => ReturnType, attributes: LazyValue<Dictionary<unknown>>): ReturnType
export function withPropagation<ReturnType>(resolver: () => Promise<ReturnType>, attributes: LazyValue<Dictionary<unknown>>): Promise<ReturnType>
export function withPropagation<ReturnType>(
  resolver: () => ReturnType | Promise<ReturnType>,
  attributes: LazyValue<Dictionary<unknown>>
): ReturnType | Promise<ReturnType> {
  try {
    let result = resolver()
    if (Promises.isPromise(result)) {
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

export const findByCodeInCausalChain = (error: ErrorEvent, code: string): ErrorEvent | undefined => {
  return findInCausalChain(error, (it) => it.code === code)
}

/*
   Traverses the causal chain of the ErrorEvent, searching for a predicate that matches (including matching on the parent error event)
   This is useful if you want to find whether or not a given error was caused by a specific failure. The search executes depth-first and
   will return te first matching instance that satisfies the predicate, or undefined otherwise
 */
export const findInCausalChain = (error: ErrorEvent, predicate: (error: ErrorEvent) => boolean): ErrorEvent | undefined => {
  if (predicate(error)) {
    return error
  }

  return Arrays.first(error.causes.map((it) => findInCausalChain(it, predicate)).filter(Objects.isPresent))
}

export const aggregate = (builder: ErrorEventBuilder, causes: Array<ErrorEvent>): ErrorEvent | undefined => {
  if (causes.length === 0) {
    return undefined
  }

  return of({ ...builder, causes })
}

export const UnhandledErrorCode: ErrorCode = 'error-event.unhandled'
export const NotFoundErrorCode: ErrorCode = 'error-event.not-found'
export const ForbiddenErrorCode: ErrorCode = 'error-event.forbidden'
export const UnauthorizedErrorCode: ErrorCode = 'error-event.unauthorized'
export const BadRequestErrorCode: ErrorCode = 'error-event.bad-request'

export const RequestCorrelationIdAttribute: ErrorAttribute<string> = 'requestCorrelationId'
export const HttpStatusCodeAttribute: ErrorAttribute<number> = 'httpStatusCode'

export const unhandled = (builder?: ErrorEventAugment) =>
  of(
    Objects.deepMerge(
      {
        code: UnhandledErrorCode,
        message: 'An Unhandled Error has occurred.',
        attributes: { [HttpStatusCodeAttribute]: 500 },
      },
      builder
    )
  )

export const notFound = (builder?: ErrorEventAugment) =>
  of(
    Objects.deepMerge(
      {
        code: NotFoundErrorCode,
        message: 'The requested Resource could not be found.',
        attributes: { [HttpStatusCodeAttribute]: 404 },
      },
      builder
    )
  )

export const unauthorized = (builder?: ErrorEventAugment) =>
  of(
    Objects.deepMerge(
      {
        code: UnauthorizedErrorCode,
        message: 'The requested Resource requires authentication.',
        attributes: { [HttpStatusCodeAttribute]: 401 },
      },
      builder
    )
  )

export const forbidden = (builder?: ErrorEventAugment) =>
  of(
    Objects.deepMerge(
      {
        code: ForbiddenErrorCode,
        message: 'The requested Resource requires additional permissions to access.',
        attributes: { [HttpStatusCodeAttribute]: 403 },
      },
      builder
    )
  )

export const badRequest = (builder?: ErrorEventAugment) =>
  of(
    Objects.deepMerge(
      {
        code: BadRequestErrorCode,
        message: 'The request is invalid and cannot be processed.',
        attributes: { [HttpStatusCodeAttribute]: 400 },
      },
      builder
    )
  )
