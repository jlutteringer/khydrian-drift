import { Arrays, Errors, Objects } from '@bessemer/cornerstone'
import { NominalType, Throwable } from '@bessemer/cornerstone/types'
import { RecordAttribute } from '@bessemer/cornerstone/object'

/*
  Represents a structured error event. The code can be mapped to a unique type of error while the
  message and attributes can provide contextual information about the error. Finally,
  an ErrorEvent could have multiple causes which get aggregated into a single parent error.
 */
export type ErrorCode = NominalType<string, 'ErrorCode'>
export type ErrorAttribute<Type = unknown> = RecordAttribute<Type, 'ErrorAttribute'>

export type ErrorEvent = {
  code: ErrorCode
  message: string
  attributes: Record<ErrorAttribute, unknown>
  causes: Array<ErrorEvent>
}

// Builder object that allows for 'partial' representation of ErrorEvents
export type ErrorEventBuilder = {
  code: ErrorCode
  message?: string | null
  attributes?: Record<ErrorAttribute, unknown>
  causes?: Array<ErrorEvent>
}

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

export const RequestCorrelationIdAttribute: ErrorAttribute<string> = 'requestCorrelationId'
export const HttpStatusCodeAttribute: ErrorAttribute<number> = 'httpStatusCode'

export const unhandled = (builder?: ErrorEventBuilder) =>
  of(
    Objects.merge(builder, {
      code: UnhandledErrorCode,
      message: 'An Unhandled Error has occurred.',
      attributes: { [HttpStatusCodeAttribute]: 500 },
    })
  )

export const notFound = (builder?: ErrorEventBuilder) =>
  of(
    Objects.merge(builder, {
      code: NotFoundErrorCode,
      message: 'The requested Resource could not be found.',
      attributes: { [HttpStatusCodeAttribute]: 404 },
    })
  )
