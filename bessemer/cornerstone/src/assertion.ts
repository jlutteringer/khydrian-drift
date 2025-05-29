import { Lazy, Objects } from '@bessemer/cornerstone'
import { LazyValue } from '@bessemer/cornerstone/lazy'
import { Nil } from '@bessemer/cornerstone/types'

export function assertUnreachable(message: LazyValue<string> = () => 'Preconditions.isUnreachable was reached'): never {
  throw new Error(Lazy.evaluate(message))
}

export function assertTrue(value: boolean, message: LazyValue<string> = () => 'Preconditions.isTrue failed validation'): asserts value is true {
  if (!value) {
    throw new Error(Lazy.evaluate(message))
  }
}

export function assertFalse(value: boolean, message: LazyValue<string> = () => 'Preconditions.isFalse failed validation'): asserts value is false {
  return assertTrue(!value, message)
}

export function assertNil(value: any, message: LazyValue<string> = () => 'Preconditions.isNil failed validation'): asserts value is Nil {
  return assertTrue(Objects.isNil(value), message)
}

export function assertPresent<T>(
  value: T,
  message: LazyValue<string> = () => 'Preconditions.isPresent failed validation'
): asserts value is NonNullable<T> {
  return assertTrue(Objects.isPresent(value), message)
}
