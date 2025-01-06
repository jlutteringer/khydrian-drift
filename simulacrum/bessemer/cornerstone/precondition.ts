import { Lazy, Objects } from '@bessemer/cornerstone'
import { LazyValue } from '@bessemer/cornerstone/lazy'
import { Nil } from '@bessemer/cornerstone/types'

export function isUnreachable(message: LazyValue<string> = 'Preconditions.isUnreachable was reached'): never {
  throw new Error(Lazy.evaluate(message))
}

export function isTrue(value: boolean, message: LazyValue<string> = 'Preconditions.isTrue failed validation'): asserts value is true {
  if (!value) {
    throw new Error(Lazy.evaluate(message))
  }
}

export function isFalse(value: boolean, message: LazyValue<string> = 'Preconditions.isFalse failed validation'): asserts value is false {
  return isTrue(!value, message)
}

export function isNil(value: any, message: LazyValue<string> = 'Preconditions.isNil failed validation'): asserts value is Nil {
  return isTrue(Objects.isNil(value), message)
}

export function isPresent<T>(value: T, message: LazyValue<string> = 'Preconditions.isPresent failed validation'): asserts value is NonNullable<T> {
  return isTrue(Objects.isPresent(value), message)
}
