import { Temporal } from '@js-temporal/polyfill'
import { namespace } from '@bessemer/cornerstone/resource-key'
import { NominalType } from '@bessemer/cornerstone/types'
import { Comparator } from '@bessemer/cornerstone/comparator'
import { fromComparator } from '@bessemer/cornerstone/equalitor'
import { failure, mapResult, Result, success } from '@bessemer/cornerstone/result'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { isError } from '@bessemer/cornerstone/error/error'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'
import Zod from 'zod'
import { Default as DefaultClock } from '@bessemer/cornerstone/temporal/clock'
import { Duration, DurationInput, from as _fromDuration } from '@bessemer/cornerstone/temporal/duration'
import { from as _fromInstant, InstantInput } from '@bessemer/cornerstone/temporal/instant'
import { TimeZoneId } from '@bessemer/cornerstone/temporal/time-zone-id'
import { TimeUnit } from '@bessemer/cornerstone/temporal/chrono'
import { isString } from '@bessemer/cornerstone/string'

export type PlainTime = Temporal.PlainTime
export const Namespace = namespace('plain-time')
export type PlainTimeLiteral = NominalType<string, typeof Namespace>
export type PlainTimeBuilder = {
  hour?: number
  minute?: number
  second?: number
  millisecond?: number
  microsecond?: number
  nanosecond?: number
}
export type PlainTimeInput = PlainTime | PlainTimeLiteral | PlainTimeBuilder

export const from = (value: PlainTimeInput): PlainTime => {
  if (value instanceof Temporal.PlainTime) {
    return value
  }
  if (isString(value)) {
    return fromString(value)
  }

  return Temporal.PlainTime.from(value)
}

export const CompareBy: Comparator<PlainTime> = (first: PlainTime, second: PlainTime): number => Temporal.PlainTime.compare(first, second)
export const EqualBy = fromComparator(CompareBy)

export const parseString = (value: string): Result<PlainTime, ErrorEvent> => {
  try {
    return success(Temporal.PlainTime.from(value))
  } catch (e) {
    if (!isError(e)) {
      throw e
    }

    return failure(invalidValue(value, { namespace: Namespace, message: e.message }))
  }
}

export const fromString = (value: string): PlainTime => {
  return unpackResult(parseString(value))
}

export const fromDuration = (duration: DurationInput): PlainTime => {
  return Midnight.add(_fromDuration(duration))
}

export const fromInstant = (instant: InstantInput, zone: TimeZoneId): PlainTime => {
  return _fromInstant(instant).toZonedDateTimeISO(zone).toPlainTime()
}

export const toLiteral = (value: PlainTime): PlainTimeLiteral => {
  if (value.second === 0 && value.millisecond === 0 && value.microsecond === 0 && value.nanosecond === 0) {
    return `${value.hour.toString().padStart(2, '0')}:${value.minute.toString().padStart(2, '0')}` as PlainTimeLiteral
  }

  return value.toString() as PlainTimeLiteral
}

export const Schema = structuredTransform(Zod.string(), (it: string) => mapResult(parseString(it), toLiteral))
export const InstanceSchema = structuredTransform(Zod.string(), parseString)

export const isPlainTime = (value: unknown): value is PlainTime => {
  return value instanceof Temporal.PlainTime
}

export const now = (clock = DefaultClock): PlainTime => {
  return fromInstant(clock.instant(), clock.zone)
}

export const merge = (element: PlainTimeInput, builder: PlainTimeBuilder): PlainTime => {
  return from(element).with(builder)
}

export const add = (element: PlainTimeInput, duration: DurationInput): PlainTime => {
  return from(element).add(_fromDuration(duration))
}

export const subtract = (element: PlainTimeInput, duration: DurationInput): PlainTime => {
  return from(element).subtract(_fromDuration(duration))
}

export const until = (element: PlainTimeInput, other: PlainTimeInput): Duration => {
  return from(element).until(from(other))
}

export const round = (element: PlainTimeInput, unit: TimeUnit): PlainTime => {
  return from(element).round({ smallestUnit: unit })
}

export const isEqual = (element: PlainTimeInput, other: PlainTimeInput): boolean => {
  return EqualBy(from(element), from(other))
}

export const isBefore = (element: PlainTimeInput, other: PlainTimeInput): boolean => {
  return CompareBy(from(element), from(other)) < 0
}

export const isAfter = (element: PlainTimeInput, other: PlainTimeInput): boolean => {
  return CompareBy(from(element), from(other)) > 0
}

export const Midnight = from({ nanosecond: 0 })
export const Noon = from({ hour: 12 })
