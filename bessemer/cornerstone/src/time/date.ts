import { addMilliseconds, isAfter as _isAfter, isBefore as _isBefore, parseISO } from 'date-fns'
import { Duration, fromMilliseconds, toMilliseconds } from '@bessemer/cornerstone/time/duration'
import { Default as DefaultClock } from '@bessemer/cornerstone/time/clock'
import Zod from 'zod'
import { failure, Result, success } from '@bessemer/cornerstone/result'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { namespace } from '@bessemer/cornerstone/resource-key'

export const Namespace = namespace('date')

export const parseString = (value: string): Result<Date, ErrorEvent> => {
  // JOHN should we only allow ISO strings here??
  try {
    const date = new Date(value)

    if (isNaN(date.getTime())) {
      return failure(
        invalidValue(value, {
          namespace: Namespace,
          message: 'Invalid date/time format.',
        })
      )
    }

    return success(date)
  } catch (e) {
    return failure(
      invalidValue(value, {
        namespace: Namespace,
        message: 'Invalid date/time format.',
      })
    )
  }
}

export const fromString = (value: string): Date => {
  return unpackResult(parseString(value))
}

export const Schema = Zod.union([
  Zod.string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/, `Invalid Date. Use YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS.sssZ`),
  Zod.date(),
]).transform((isoString) => {
  const date = new Date(isoString)
  // Additional check to ensure the parsed date is valid
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date')
  }
  return date
})

export const isDate = (value: unknown): value is Date => {
  return value instanceof Date && !isNaN(value.getTime())
}

export const now = (clock = DefaultClock): Date => {
  return clock.instant()
}

export const of = (dateString: string): Date => {
  return parseISO(dateString)
}

export const addDuration = (element: Date, duration: Duration): Date => {
  return addMilliseconds(element, toMilliseconds(duration))
}

export const subtractDuration = (element: Date, duration: Duration): Date => {
  return addMilliseconds(element, -toMilliseconds(duration))
}

export const isBefore = (element: Date, other: Date): boolean => {
  return _isBefore(element, other)
}

export const isAfter = (element: Date, other: Date): boolean => {
  return _isAfter(element, other)
}

export const timeUntil = (element: Date, other: Date): Duration => {
  return fromMilliseconds(other.getTime() - element.getTime())
}

export const timeBetween = (element: Date, other: Date): Duration => {
  return fromMilliseconds(Math.abs(timeUntil(element, other)))
}
