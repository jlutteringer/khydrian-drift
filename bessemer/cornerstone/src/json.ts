import { JsonValue } from 'type-fest'
import { getValueOrThrow, Result, tryValue } from '@bessemer/cornerstone/result'

export const parse = (data: string): Result<any> => {
  return tryValue(() => JSON.parse(data) as JsonValue)
}

export const parseOrThrow = (data: string): Result<any> => {
  return getValueOrThrow(parse(data))
}
