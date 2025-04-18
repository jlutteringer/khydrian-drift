import { Results } from '@bessemer/cornerstone'
import { JsonValue } from 'type-fest'
import { Result } from '@bessemer/cornerstone/result'

export const parse = (data: string): Result<any> => {
  return Results.tryValue(() => JSON.parse(data) as JsonValue)
}

export const parseOrThrow = (data: string): Result<any> => {
  return Results.getValueOrThrow(parse(data))
}
