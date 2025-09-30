import { NominalType } from '@bessemer/cornerstone/types'
import Zod from 'zod'
import { Result, tryValue } from '@bessemer/cornerstone/result'

export type ZonedTime = NominalType<string, 'ZonedTime'>

export const of = (value: string): ZonedTime => {
  return value as ZonedTime
}

export const Schema = Zod.string()
  .regex(/^\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/)
  .transform(of)

export const fromString = (value: string): ZonedTime => {
  return Schema.parse(value)
}

export const parseString = (value: string): Result<ZonedTime> => {
  return tryValue(() => fromString(value))
}
