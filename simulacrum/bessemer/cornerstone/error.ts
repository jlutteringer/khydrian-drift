import { Objects } from '@bessemer/cornerstone'
import { isError as _isError } from 'lodash-es'

export const isError = _isError

export const findInCausalChain = (error: Error, predicate: (error: Error) => boolean): Error | undefined => {
  if (predicate(error)) {
    return error
  }

  if (Objects.isPresent(error.cause) && error.cause instanceof Error) {
    return findInCausalChain(error.cause, predicate)
  }

  return undefined
}
