import { isError as _isError } from 'lodash-es'
import { isPresent } from '@bessemer/cornerstone/object'

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
