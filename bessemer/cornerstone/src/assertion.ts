import { evaluate, LazyValue } from '@bessemer/cornerstone/lazy'
import { Nil } from '@bessemer/cornerstone/types'
import { isNil, isPresent } from '@bessemer/cornerstone/object'

export function assert(message: LazyValue<string> = () => 'Assertions.assertUnreachable was reached'): never {
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
