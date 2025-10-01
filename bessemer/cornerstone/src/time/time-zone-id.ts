import { failure, Result, success } from '@bessemer/cornerstone/result'
import Zod from 'zod'
import { NominalType } from '@bessemer/cornerstone/types'
import { namespace } from '@bessemer/cornerstone/resource-key'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { isError } from '@bessemer/cornerstone/error/error'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'
import { TimeZoneOffset } from '@bessemer/cornerstone/time/time-zone-offset'

export const Namespace = namespace('time-zone-id')
export type TimeZoneId = NominalType<string, typeof Namespace>

export const parseString = (value: string): Result<TimeZoneId, ErrorEvent> => {
  try {
    const fmt = new Intl.DateTimeFormat(undefined, { timeZone: value })
    return success(fmt.resolvedOptions().timeZone as TimeZoneId)
  } catch (e) {
    if (isError(e)) {
      return failure(invalidValue(value, { namespace: Namespace, message: e.message }))
    } else {
      throw e
    }
  }
}

export const fromString = (value: string): TimeZoneId => {
  return unpackResult(parseString(value))
}

export const Schema = structuredTransform(Zod.string(), parseString)

export const getOffset = (timeZone: TimeZoneId, instant: Date): TimeZoneOffset => {
  const instantWithoutMs = new Date(Math.floor(instant.getTime() / 1000) * 1000)

  // Note: We use 'en-CA' locale because it produces ISO 8601 format (YYYY-MM-DD, HH:MM:SS)
  // which is predictable and easily parseable. The locale only affects the output format,
  // not the timezone conversion - that's handled by the timeZone parameter.
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const formatted = formatter.format(instantWithoutMs)
  const localTime = new Date(formatted + 'Z').getTime()

  const offsetMs = localTime - instantWithoutMs.getTime()
  return offsetMs as TimeZoneOffset
}

export const Utc = 'UTC' as TimeZoneId
export const SystemDefault = Intl.DateTimeFormat().resolvedOptions().timeZone as TimeZoneId
