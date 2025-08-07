import { isError as _isError } from 'lodash-es'
import { isPresent } from '@bessemer/cornerstone/object'
import { Throwable } from '@bessemer/cornerstone/types'

export const isError = _isError

export const findInCausalChain = (error: Error, predicate: (error: Error) => boolean): Error | undefined => {
  if (predicate(error)) {
    return error
  }

  if (isPresent(error.cause) && error.cause instanceof Error) {
    return findInCausalChain(error.cause, predicate)
  }

  return undefined
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
