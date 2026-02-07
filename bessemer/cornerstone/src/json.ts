import { JsonValue } from 'type-fest'
import { Result, tryValue } from '@bessemer/cornerstone/result'

export const parse = (data: string): Result<JsonValue, SyntaxError> => {
  return tryValue(() => JSON.parse(data) as JsonValue) as Result<JsonValue, SyntaxError>
}
