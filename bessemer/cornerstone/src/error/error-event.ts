import { Dictionary, Throwable } from '@bessemer/cornerstone/types'
import { deepMerge, isNil, isObject, isPresent } from '@bessemer/cornerstone/object'
import Zod from 'zod'
import { evaluate, LazyValue } from '@bessemer/cornerstone/lazy'
import { findInCausalChain as errorsFindInCausalChain, isError } from '@bessemer/cornerstone/error/error'
import { isPromise } from '@bessemer/cornerstone/promise'
import { createNamespace } from '@bessemer/cornerstone/resource-key'
import { Result } from '@bessemer/cornerstone/result'
import * as ErrorCauses from '@bessemer/cornerstone/error/error-cause'
import { ErrorCauseAugment, ErrorCauseBuilder } from '@bessemer/cornerstone/error/error-cause'
import * as Assertions from '@bessemer/cornerstone/assertion'
import { MergeExclusive } from 'type-fest'
import { isEmpty } from '@bessemer/cornerstone/array'

export const Namespace = createNamespace('error-event')

export const Schema = Zod.object({
  _type: Namespace,
  message: Zod.string(),
  causes: Zod.array(ErrorCauses.Schema),
  context: Zod.record(Zod.string(), Zod.unknown()),
})

export type ErrorEvent = Zod.infer<typeof Schema>

type ErrorEventCommonBuilder = {
  message: string
  context?: Dictionary<unknown>
}

type ErrorEventFullBuilder = ErrorEventCommonBuilder & {
  causes: Array<ErrorCauseBuilder>
}
type ErrorEventSingletonBuilder = ErrorEventCommonBuilder & ErrorCauseBuilder
export type ErrorEventBuilder = MergeExclusive<ErrorEventFullBuilder, ErrorEventSingletonBuilder>

// An exception type that contains an ErrorEvent
export class ErrorEventException extends Error {
  readonly errorEvent: ErrorEvent

  constructor(errorEvent: ErrorEvent, cause?: unknown) {
    super(errorEvent.message ?? '', { cause })
    this.name = this.constructor.name
    this.errorEvent = errorEvent
  }
}

export const from = (builder: ErrorEventBuilder): ErrorEvent => {
  if (isPresent(builder.code)) {
    const code = builder.code
    return {
      _type: Namespace,
      causes: [ErrorCauses.from({ code, ...builder })],
      message: builder.message,
      context: builder.context ?? {},
    }
  } else {
    Assertions.assertPresent(builder.causes)
    Assertions.assert(!isEmpty(builder.causes), () => 'ErrorEvent - Unable to construct ErrorEvent with empty causes array.')

    return {
      _type: Namespace,
      causes: builder.causes.map(ErrorCauses.from),
      message: builder.message,
      context: builder.context ?? {},
    }
  }
}

export const fromThrowable = (throwable: Throwable): ErrorEvent => {
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

export const isErrorEvent = (value: unknown): value is ErrorEvent => {
  if (!isObject(value)) {
    return false
  }

  const errorEvent = value as ErrorEvent
  return errorEvent._type === Namespace
}

export const isErrorEventException = (value: unknown): value is ErrorEventException => {
  return value instanceof ErrorEventException
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

export const propagate = (throwable: Throwable, context: Dictionary<unknown>): never => {
  if (isErrorEventException(throwable)) {
    // We just mutate the existing error event to avoid nested exceptions
    const errorEvent = throwable.errorEvent
    errorEvent.context = { ...errorEvent.context, ...context }
    throw throwable
  } else {
    const errorEvent = fromThrowable(throwable)
    const contextualizedEvent = from({ ...errorEvent, context: { ...errorEvent.context, ...context } })
    throw new ErrorEventException(contextualizedEvent, throwable)
  }
}

export type ErrorEventAugment = ErrorCauseAugment & {
  context?: Dictionary<unknown>
}

export const unhandled = (builder?: ErrorEventAugment): ErrorEvent => from(deepMerge(ErrorCauses.unhandled(builder), builder))

export const required = (builder?: ErrorEventAugment): ErrorEvent => from(deepMerge(ErrorCauses.required(builder), builder))

export const unauthorized = (builder?: ErrorEventAugment): ErrorEvent => from(deepMerge(ErrorCauses.unauthorized(builder), builder))

export const forbidden = (builder?: ErrorEventAugment): ErrorEvent => from(deepMerge(ErrorCauses.forbidden(builder), builder))

export const badRequest = (builder?: ErrorEventAugment): ErrorEvent => from(deepMerge(ErrorCauses.badRequest(builder), builder))

export const invalidValue = (value: unknown, builder?: ErrorEventAugment): ErrorEvent =>
  from(deepMerge(ErrorCauses.invalidValue(value, builder), builder))

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

export function assertValid(value: boolean, builder: LazyValue<ErrorEventAugment | undefined> = () => undefined): asserts value is true {
  if (!value) {
    throw new ErrorEventException(badRequest(evaluate(builder)))
  }
}

export function assert(value: boolean, builder: LazyValue<ErrorEventBuilder>): asserts value is true {
  if (!value) {
    throw new ErrorEventException(from(evaluate(builder)))
  }
}

export const unpackResult = <T>(result: Result<T, ErrorEvent>): T => {
  if (!result.isSuccess) {
    throw new ErrorEventException(result.value)
  }

  return result.value
}
