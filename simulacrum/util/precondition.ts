import { Objects } from '@simulacrum/util/index'

export const isTrue = (value: boolean, message: () => string = () => 'Preconditions.isTrue failed validation') => {
  if (!value) {
    throw new Error(message())
  }
}

export const isFalse = (value: boolean, message: () => string = () => 'Preconditions.isFalse failed validation') => isTrue(!value, message)

export const isNil = (value: any, message: () => string = () => 'Preconditions.isNil failed validation') => isTrue(Objects.isNil(value), message)

export function isPresent<T>(value: T, message: () => string = () => 'Preconditions.isPresent failed validation'): asserts value is NonNullable<T> {
  return isTrue(Objects.isPresent(value), message)
}

export const isClientSide = (message: () => string = () => 'Preconditions.isClientSide failed validation') => isTrue(typeof window === 'undefined', message)

export const isServerSide = (message: () => string = () => 'Preconditions.isServerSide failed validation') => isTrue(typeof window !== 'undefined', message)
