import { Result, tryValue } from '@bessemer/cornerstone/result'
import Zod from 'zod'
import { NominalType } from '@bessemer/cornerstone/types'

export type TimeZoneId = NominalType<string, 'TimeZoneId'>

export const fromString = (value: string): TimeZoneId => {
  const fmt = new Intl.DateTimeFormat(undefined, { timeZone: value })
  return fmt.resolvedOptions().timeZone as TimeZoneId
}

export const parseString = (value: string): Result<TimeZoneId> => {
  return tryValue(() => {
    return fromString(value)
  })
}

export const Schema = Zod.string().transform(fromString)
