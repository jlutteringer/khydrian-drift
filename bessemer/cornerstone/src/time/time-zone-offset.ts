import { NominalType } from '@bessemer/cornerstone/types'
import { Duration, fromHours, fromMinutes, fromSeconds } from '@bessemer/cornerstone/time/duration'
import { failure, Result, success } from '@bessemer/cornerstone/result'
import Zod from 'zod'

export type TimeZoneOffset = NominalType<Duration, 'TimeZoneOffset'>

const EighteenHours = fromHours(18)

export const fromMilliseconds = (value: number): TimeZoneOffset => {
  if (value < -EighteenHours || value > EighteenHours) {
    throw new Error(`Time zone offset must be between -18:00 and +18:00 inclusive: ${value}`)
  }

  return value as TimeZoneOffset
}

export const fromDuration = (duration: Duration): TimeZoneOffset => {
  return fromMilliseconds(duration)
}

export const parseString = (value: string): Result<TimeZoneOffset, string> => {
  if (value === 'Z') {
    return success(0 as TimeZoneOffset)
  }

  if (!value.startsWith('+') && !value.startsWith('-')) {
    return failure(`Invalid time zone offset format - must start with +, -, or be Z: ${value}`)
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
      return failure(`Invalid hour value in time zone offset: ${value}`)
    }
  } else if (offsetStr.length === 2) {
    // +hh format
    hours = parseInt(offsetStr, 10)
    if (isNaN(hours)) {
      return failure(`Invalid hour value in time zone offset: ${value}`)
    }
  } else if (offsetStr.includes(':')) {
    // Formats with colons: +hh:mm or +hh:mm:ss
    const parts = offsetStr.split(':')
    if (parts.length < 2 || parts.length > 3) {
      return failure(`Invalid time zone offset format: ${value}`)
    }

    hours = parseInt(parts[0]!, 10)
    minutes = parseInt(parts[1]!, 10)

    if (parts.length === 3) {
      seconds = parseInt(parts[2]!, 10)
    }

    if (isNaN(hours) || isNaN(minutes) || (parts.length === 3 && isNaN(seconds))) {
      return failure(`Invalid time values in time zone offset: ${value}`)
    }
  } else if (offsetStr.length === 4) {
    // +hhmm format
    hours = parseInt(offsetStr.slice(0, 2), 10)
    minutes = parseInt(offsetStr.slice(2, 4), 10)

    if (isNaN(hours) || isNaN(minutes)) {
      return failure(`Invalid time values in time zone offset: ${value}`)
    }
  } else if (offsetStr.length === 6) {
    // +hhmmss format
    hours = parseInt(offsetStr.slice(0, 2), 10)
    minutes = parseInt(offsetStr.slice(2, 4), 10)
    seconds = parseInt(offsetStr.slice(4, 6), 10)

    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
      return failure(`Invalid time values in time zone offset: ${value}`)
    }
  } else {
    return failure(`Invalid time zone offset format: ${value}`)
  }

  if (minutes >= 60) {
    return failure(`Invalid minutes in time zone offset: must be less than 60: ${value}`)
  }

  if (seconds >= 60) {
    return failure(`Invalid seconds in time zone offset: must be less than 60: ${value}`)
  }

  const totalMilliseconds = sign * (fromHours(hours) + fromMinutes(minutes) + fromSeconds(seconds))

  if (totalMilliseconds < -EighteenHours || totalMilliseconds > EighteenHours) {
    return failure(`Time zone offset must be between -18:00 and +18:00 inclusive: ${value}`)
  }

  return success(totalMilliseconds as TimeZoneOffset)
}

export const fromString = (value: string): TimeZoneOffset => {
  const result = parseString(value)
  if (!result.isSuccess) {
    throw new Error(result.value)
  }

  return result.value
}

export const Schema = Zod.union([Zod.number().transform(fromMilliseconds), Zod.string().transform(fromString)])
