import { addHours as _addHours, addMilliseconds as _addMilliseconds, isAfter as _isAfter, isBefore as _isBefore, parseISO } from 'date-fns'
import { Duration, toMilliseconds } from '@bessemer/cornerstone/time/duration'
import { Default as DefaultClock } from '@bessemer/cornerstone/time/clock'
import Zod from 'zod'

export const SchemaX = Zod.union([
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

export const addMilliseconds = _addMilliseconds
export const addHours = _addHours
export const isBefore = _isBefore
export const isAfter = _isAfter
export const addDuration = (date: Date, duration: Duration): Date => addMilliseconds(date, toMilliseconds(duration))
