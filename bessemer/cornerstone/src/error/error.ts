import { isPresent } from '@bessemer/cornerstone/object'
import { Throwable } from '@bessemer/cornerstone/types'
import { LazyValue } from '@bessemer/cornerstone/lazy'
import { assert } from '@bessemer/cornerstone/assertion'

export const isError = (value: unknown): value is Error => {
  return (
    value instanceof Error ||
    (typeof value === 'object' &&
      value !== null &&
      'name' in value &&
      'message' in value &&
      (typeof (value as any).name === 'string' || typeof (value as any).name === 'undefined') &&
      typeof (value as any).message === 'string')
  )
}

export function assertError(value: unknown, message: LazyValue<string> = () => 'Errors.assertError failed validation'): asserts value is Error {
  return assert(isError(value), message)
}

export const getCausalChain = (error: Error): Array<Error> => {
  const chain: Array<Error> = []
  let current: Error = error

  while (true) {
    chain.push(current)

    if (!isPresent(current.cause) || !isError(current.cause)) {
      break
    }

    current = current.cause
  }

  return chain
}

export const findInCausalChain = (error: Error, predicate: (error: Error) => boolean): Error | undefined => {
  return getCausalChain(error).find(predicate)
}

export type ErrorDto = {
  name: string
  message: string
  stack: string | null
  cause: ErrorDto | null
}

export const serialize = (error: Throwable): ErrorDto => {
  if (!isError(error)) {
    // JOHN
    return { name: " Can't serialize error", message: 'Error is not an instance of Error', stack: null, cause: null }
  }

  const cause = isPresent(error.cause) ? serialize(error.cause) : null

  const serialized: ErrorDto = {
    name: error.name,
    message: error.message,
    stack: error.stack ?? null,
    cause,
  }

  return serialized
}
