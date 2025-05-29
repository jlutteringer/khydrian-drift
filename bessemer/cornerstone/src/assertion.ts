import { Lazy, Objects } from '@bessemer/cornerstone'
import { LazyValue } from '@bessemer/cornerstone/lazy'
import { Nil } from '@bessemer/cornerstone/types'
import { badRequest, ErrorEventBuilder, ErrorEventException, forbidden, notFound, of, unauthorized } from '@bessemer/cornerstone/error-event'

export function assertUnreachable(message: LazyValue<string> = () => 'Assertions.assertUnreachable was reached'): never {
  throw new Error(Lazy.evaluate(message))
}

export function assertTrue(value: boolean, message: LazyValue<string> = () => 'Assertions.assertTrue failed validation'): asserts value is true {
  if (!value) {
    throw new Error(Lazy.evaluate(message))
  }
}

export function assertFalse(value: boolean, message: LazyValue<string> = () => 'Assertions.assertFalse failed validation'): asserts value is false {
  return assertTrue(!value, message)
}

export function assertNil(value: any, message: LazyValue<string> = () => 'Assertions.assertNil failed validation'): asserts value is Nil {
  return assertTrue(Objects.isNil(value), message)
}

export function assertPresent<T>(
  value: T,
  message: LazyValue<string> = () => 'Assertions.assertPresent failed validation'
): asserts value is NonNullable<T> {
  return assertTrue(Objects.isPresent(value), message)
}

export function expectPresent<T>(
  value: T,
  builder: LazyValue<Partial<ErrorEventBuilder> | undefined> = () => undefined
): asserts value is NonNullable<T> {
  if (!Objects.isPresent(value)) {
    throw new ErrorEventException(notFound(Lazy.evaluate(builder)))
  }
}

export function expectAuthorized<T>(
  value: boolean,
  builder: LazyValue<Partial<ErrorEventBuilder> | undefined> = () => undefined
): asserts value is true {
  if (!value) {
    throw new ErrorEventException(unauthorized(Lazy.evaluate(builder)))
  }
}

export function expectPermitted<T>(
  value: boolean,
  builder: LazyValue<Partial<ErrorEventBuilder> | undefined> = () => undefined
): asserts value is true {
  if (!value) {
    throw new ErrorEventException(forbidden(Lazy.evaluate(builder)))
  }
}

export function expectValid<T>(value: boolean, builder: LazyValue<Partial<ErrorEventBuilder> | undefined> = () => undefined): asserts value is true {
  if (!Objects.isPresent(value)) {
    throw new ErrorEventException(badRequest(Lazy.evaluate(builder)))
  }
}

export function expect<T>(value: boolean, builder: LazyValue<ErrorEventBuilder>): asserts value is true {
  if (!Objects.isPresent(value)) {
    throw new ErrorEventException(of(Lazy.evaluate(builder)))
  }
}
