import { failure, Result, success } from '@bessemer/cornerstone/result'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { Namespace } from '@bessemer/cornerstone/net/domain-name'
import { ValueOf } from 'type-fest'

export const HttpMethod = {
  Get: 'get',
  Post: 'post',
  Put: 'put',
  Patch: 'patch',
  Delete: 'delete',
  Head: 'head',
  Options: 'options',
  Trace: 'trace',
  Connect: 'connect',
} as const
export type HttpMethod = ValueOf<typeof HttpMethod>

export const parseString = (value: string): Result<HttpMethod, ErrorEvent> => {
  const normalizedValue = value.toLowerCase()
  const validMethods = Object.values(HttpMethod)

  if (!validMethods.includes(normalizedValue as HttpMethod)) {
    return failure(
      invalidValue(value, {
        namespace: Namespace,
        message: `[${Namespace}]: Invalid HttpMethod in string: [${value}]. Valid methods are: ${validMethods.join(', ')}`,
      })
    )
  }

  return success(normalizedValue as HttpMethod)
}

export const from = (value: string): HttpMethod => {
  return unpackResult(parseString(value))
}
