import { JsonValue } from 'type-fest'
import { Result, tryValue } from '@bessemer/cornerstone/result'

export const parse = (data: string): Result<any> => {
  return tryValue(() => JSON.parse(data) as JsonValue)
}
