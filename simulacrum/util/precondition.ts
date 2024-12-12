import { Lazy, Objects } from '@simulacrum/util/index'
import { LazyValue } from '@simulacrum/util/lazy'

export const isUnreachable = (message: LazyValue<string> = 'Preconditions.isUnreachable was reached') => {
  throw new Error(Lazy.evaluate(message))
}

export const isTrue = (value: boolean, message: LazyValue<string> = 'Preconditions.isTrue failed validation') => {
  if (!value) {
    throw new Error(Lazy.evaluate(message))
  }
}

export const isFalse = (value: boolean, message: LazyValue<string> = 'Preconditions.isFalse failed validation') => isTrue(!value, message)

export const isNil = (value: any, message: LazyValue<string> = 'Preconditions.isNil failed validation') => isTrue(Objects.isNil(value), message)

export function isPresent<T>(value: T, message: LazyValue<string> = 'Preconditions.isPresent failed validation'): asserts value is NonNullable<T> {
  return isTrue(Objects.isPresent(value), message)
}

export const isClientSide = (message: LazyValue<string> = 'Preconditions.isClientSide failed validation') => isTrue(typeof window === 'undefined', message)

export const isServerSide = (message: LazyValue<string> = 'Preconditions.isServerSide failed validation') => isTrue(typeof window !== 'undefined', message)
