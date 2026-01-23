import { isPresent } from '@bessemer/cornerstone/object'
import { Throwable } from '@bessemer/cornerstone/types'
import { LazyValue } from '@bessemer/cornerstone/lazy'
import { assert } from '@bessemer/cornerstone/assertion'

export const isError = (value: unknown): value is Error => {
  return value instanceof Error
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

const serializeError = (error: Throwable): any => {
  if (!isPresent(error)) {
    return undefined
  }

  if (!isError(error)) {
    return error
  }

  const cause = isPresent(error.cause) ? serializeError(error.cause) : undefined

  const serialized = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    cause,
  }

  return serialized
}
