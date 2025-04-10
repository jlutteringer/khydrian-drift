import { addHours as _addHours, addMilliseconds as _addMilliseconds, isAfter as _isAfter, isBefore as _isBefore, parseISO } from 'date-fns'
import { isDate as _isDate } from 'lodash-es'
import { Duration } from '@bessemer/cornerstone/duration'
import { Durations } from '@bessemer/cornerstone'

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

export const addDuration = (date: Date, duration: Duration): Date => addMilliseconds(date, Durations.inMilliseconds(duration))
