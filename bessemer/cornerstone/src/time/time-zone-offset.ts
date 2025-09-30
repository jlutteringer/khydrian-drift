import { NominalType } from '@bessemer/cornerstone/types'
import { Duration, fromHours, fromMinutes, fromSeconds } from '@bessemer/cornerstone/time/duration'
import { failure, Result, success } from '@bessemer/cornerstone/result'
import Zod from 'zod'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { namespace } from '@bessemer/cornerstone/resource-key'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'

export const Namespace = namespace('time-zone-offset')
export type TimeZoneOffset = NominalType<Duration, typeof Namespace>

const EighteenHours = fromHours(18)

export const parseNumber = (value: number): Result<TimeZoneOffset, ErrorEvent> => {
  if (value < -EighteenHours || value > EighteenHours) {
    return failure(invalidValue(value, { namespace: Namespace, message: `TimeZoneOffset must be between -18:00 and +18:00 inclusive.` }))
  }

  return success(value as TimeZoneOffset)
}

export const fromMilliseconds = (value: number): TimeZoneOffset => {
  return unpackResult(parseNumber(value))
}

export const fromDuration = (duration: Duration): TimeZoneOffset => {
  return fromMilliseconds(duration)
}

export const parseString = (value: string): Result<TimeZoneOffset, ErrorEvent> => {
  if (value === 'Z') {
    return success(0 as TimeZoneOffset)
  }

  if (!value.startsWith('+') && !value.startsWith('-')) {
    return failure(invalidValue(value, { namespace: Namespace, message: `TimeZoneOffset must start with +, -, or be Z.` }))
  }

  const sign = value[0] === '+' ? 1 : -1
  const offsetStr = value.slice(1)

  let hours = 0
  let minutes = 0
  let seconds = 0

  // Parse different formats
  if (offsetStr.length === 1) {
    // +h format
    hours = parseInt(offsetStr, 10)
    if (isNaN(hours)) {
      return failure(invalidValue(value, { namespace: Namespace, message: `TimeZoneOffset - Invalid hour value in time zone offset.` }))
    }
  } else if (offsetStr.length === 2) {
    // +hh format
    hours = parseInt(offsetStr, 10)
    if (isNaN(hours)) {
      return failure(invalidValue(value, { namespace: Namespace, message: `TimeZoneOffset - Invalid hour value in time zone offset.` }))
    }
  } else if (offsetStr.includes(':')) {
    // Formats with colons: +hh:mm or +hh:mm:ss
    const parts = offsetStr.split(':')
    if (parts.length < 2 || parts.length > 3) {
      return failure(invalidValue(value, { namespace: Namespace, message: `TimeZoneOffset - Invalid time zone offset format.` }))
    }

    hours = parseInt(parts[0]!, 10)
    minutes = parseInt(parts[1]!, 10)

    if (parts.length === 3) {
      seconds = parseInt(parts[2]!, 10)
    }

    if (isNaN(hours) || isNaN(minutes) || (parts.length === 3 && isNaN(seconds))) {
      return failure(invalidValue(value, { namespace: Namespace, message: `TimeZoneOffset - Invalid time values in time zone offset.` }))
    }
  } else if (offsetStr.length === 4) {
    // +hhmm format
    hours = parseInt(offsetStr.slice(0, 2), 10)
    minutes = parseInt(offsetStr.slice(2, 4), 10)

    if (isNaN(hours) || isNaN(minutes)) {
      return failure(invalidValue(value, { namespace: Namespace, message: `TimeZoneOffset - Invalid time values in time zone offset.` }))
    }
  } else if (offsetStr.length === 6) {
    // +hhmmss format
    hours = parseInt(offsetStr.slice(0, 2), 10)
    minutes = parseInt(offsetStr.slice(2, 4), 10)
    seconds = parseInt(offsetStr.slice(4, 6), 10)

    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
      return failure(invalidValue(value, { namespace: Namespace, message: `TimeZoneOffset - Invalid time values in time zone offset.` }))
    }
  } else {
    return failure(invalidValue(value, { namespace: Namespace, message: `TimeZoneOffset - Invalid time zone offset format.` }))
  }

  if (minutes >= 60) {
    return failure(
      invalidValue(value, { namespace: Namespace, message: `TimeZoneOffset - Invalid minutes in time zone offset: must be less than 60.` })
    )
  }

  if (seconds >= 60) {
    return failure(
      invalidValue(value, { namespace: Namespace, message: `TimeZoneOffset - Invalid seconds in time zone offset: must be less than 60.` })
    )
  }

  const totalMilliseconds = sign * (fromHours(hours) + fromMinutes(minutes) + fromSeconds(seconds))

  if (totalMilliseconds < -EighteenHours || totalMilliseconds > EighteenHours) {
    return failure(invalidValue(value, { namespace: Namespace, message: `TimeZoneOffset must be between -18:00 and +18:00 inclusive.` }))
  }

  return success(totalMilliseconds as TimeZoneOffset)
}

export const fromString = (value: string): TimeZoneOffset => {
  return unpackResult(parseString(value))
}

export const Schema = Zod.union([structuredTransform(Zod.number(), parseNumber), structuredTransform(Zod.string(), parseString)])
