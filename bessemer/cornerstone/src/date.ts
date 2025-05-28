import { addHours as _addHours, addMilliseconds as _addMilliseconds, isAfter as _isAfter, isBefore as _isBefore, parseISO } from 'date-fns'
import { isDate as _isDate } from 'lodash-es'
import { Duration } from '@bessemer/cornerstone/duration'
import { Durations } from '@bessemer/cornerstone'
import Zod from 'zod'

export const buildSchema = (fieldName: string) => {
  return Zod.union([
    Zod.string({
      required_error: `${fieldName} is required`,
    })
      .trim()
      .regex(
        /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/,
        `${fieldName} is an invalid Date. Use YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS.sssZ`
      ),
    Zod.date({
      required_error: `${fieldName} is required`,
    }),
  ]).transform((isoString) => {
    const date = new Date(isoString)
    // Additional check to ensure the parsed date is valid
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date')
    }
    return date
  })
}

export const isDate = _isDate

export const now = (): Date => {
  return new Date()
}

export const of = (dateString: string): Date => {
  return parseISO(dateString)
}

export const addMilliseconds = _addMilliseconds
export const addHours = _addHours
export const isBefore = _isBefore
export const isAfter = _isAfter

export const addDuration = (date: Date, duration: Duration): Date => addMilliseconds(date, Durations.toMilliseconds(duration))
