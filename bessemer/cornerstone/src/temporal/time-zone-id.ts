import { failure, Result, success } from '@bessemer/cornerstone/result'
import Zod from 'zod'
import { NominalType } from '@bessemer/cornerstone/types'
import { createNamespace } from '@bessemer/cornerstone/resource-key'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { isError } from '@bessemer/cornerstone/error/error'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'

export const Namespace = createNamespace('time-zone-id')
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

export const from = (value: string): TimeZoneId => {
  return unpackResult(parseString(value))
}

export const Schema = structuredTransform(Zod.string(), parseString)

export const Utc = 'UTC' as TimeZoneId
export const getSystemDefault = (): TimeZoneId => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone as TimeZoneId
}
