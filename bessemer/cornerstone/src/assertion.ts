import { evaluate, LazyValue } from '@bessemer/cornerstone/lazy'
import { Nil } from '@bessemer/cornerstone/types'
import {
  badRequest,
  ErrorEventAugment,
  ErrorEventBuilder,
  ErrorEventException,
  forbidden,
  notFound,
  of,
  unauthorized,
} from '@bessemer/cornerstone/error-event'
import { isNil, isPresent } from '@bessemer/cornerstone/object'

export function assertUnreachable(message: LazyValue<string> = () => 'Assertions.assertUnreachable was reached'): never {
  throw new Error(evaluate(message))
}

export function assertTrue(value: boolean, message: LazyValue<string> = () => 'Assertions.assertTrue failed validation'): asserts value is true {
  if (!value) {
    throw new Error(evaluate(message))
  }
}

export function assertFalse(value: boolean, message: LazyValue<string> = () => 'Assertions.assertFalse failed validation'): asserts value is false {
  return assertTrue(!value, message)
}

export function assertNil(value: any, message: LazyValue<string> = () => 'Assertions.assertNil failed validation'): asserts value is Nil {
  return assertTrue(isNil(value), message)
}

export function assertPresent<T>(
  value: T,
  message: LazyValue<string> = () => 'Assertions.assertPresent failed validation'
): asserts value is NonNullable<T> {
  return assertTrue(isPresent(value), message)
}

export function expectPresent<T>(value: T, builder: LazyValue<ErrorEventAugment | undefined> = () => undefined): asserts value is NonNullable<T> {
  if (isNil(value)) {
    throw new ErrorEventException(notFound(evaluate(builder)))
  }
}

export function expectAuthorized<T>(value: boolean, builder: LazyValue<ErrorEventAugment | undefined> = () => undefined): asserts value is true {
  if (!value) {
    throw new ErrorEventException(unauthorized(evaluate(builder)))
  }
}

export function expectPermitted<T>(value: boolean, builder: LazyValue<ErrorEventAugment | undefined> = () => undefined): asserts value is true {
  if (!value) {
    throw new ErrorEventException(forbidden(evaluate(builder)))
  }
}

export function expectValid<T>(value: boolean, builder: LazyValue<ErrorEventAugment | undefined> = () => undefined): asserts value is true {
  if (!value) {
    throw new ErrorEventException(badRequest(evaluate(builder)))
  }
}

export function expect<T>(value: boolean, builder: LazyValue<ErrorEventBuilder>): asserts value is true {
  if (!value) {
    throw new ErrorEventException(of(evaluate(builder)))
  }
}
