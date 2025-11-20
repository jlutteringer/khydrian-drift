import { Temporal } from '@js-temporal/polyfill'
import { createNamespace } from '@bessemer/cornerstone/resource-key'
import { NominalType } from '@bessemer/cornerstone/types'
import { Comparator } from '@bessemer/cornerstone/comparator'
import { fromComparator } from '@bessemer/cornerstone/equalitor'
import { failure, Result, success } from '@bessemer/cornerstone/result'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { isError } from '@bessemer/cornerstone/error/error'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'
import Zod from 'zod'
import { Default as DefaultClock } from '@bessemer/cornerstone/temporal/clock'
import { Duration, DurationLike, from as _fromDuration } from '@bessemer/cornerstone/temporal/duration'
import { from as _fromInstant, InstantLike } from '@bessemer/cornerstone/temporal/instant'
import { TimeZoneId } from '@bessemer/cornerstone/temporal/time-zone-id'
import { TimeUnit } from '@bessemer/cornerstone/temporal/chrono'
import { isString } from '@bessemer/cornerstone/string'
import { isNil } from '@bessemer/cornerstone/object'
import { Locale } from '@bessemer/cornerstone/intl/locale'

export type PlainTime = Temporal.PlainTime
export const Namespace = createNamespace('plain-time')
export type PlainTimeLiteral = NominalType<string, typeof Namespace>
export type PlainTimeBuilder = {
  hour: number
  minute?: number
  second?: number
  millisecond?: number
  microsecond?: number
  nanosecond?: number
}
export type PlainTimeLike = PlainTime | PlainTimeLiteral | PlainTimeBuilder

export function from(value: PlainTimeLike | string): PlainTime
export function from(value: PlainTimeLike | string | null): PlainTime | null
export function from(value: PlainTimeLike | string | undefined): PlainTime | undefined
export function from(value: PlainTimeLike | string | null | undefined): PlainTime | null | undefined
export function from(value: PlainTimeLike | string | null | undefined): PlainTime | null | undefined {
  if (isNil(value)) {
    return value
  }

  if (value instanceof Temporal.PlainTime) {
    return value
  }
  if (isString(value)) {
    return unpackResult(parseString(value))
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

export const fromDuration = (duration: DurationLike): PlainTime => {
  return Midnight.add(_fromDuration(duration))
}

export const fromInstant = (instant: InstantLike, zone: TimeZoneId): PlainTime => {
  return _fromInstant(instant).toZonedDateTimeISO(zone).toPlainTime()
}

export function toLiteral(likeValue: PlainTimeLike): PlainTimeLiteral
export function toLiteral(likeValue: PlainTimeLike | null): PlainTimeLiteral | null
export function toLiteral(likeValue: PlainTimeLike | undefined): PlainTimeLiteral | undefined
export function toLiteral(likeValue: PlainTimeLike | null | undefined): PlainTimeLiteral | null | undefined
export function toLiteral(likeValue: PlainTimeLike | null | undefined): PlainTimeLiteral | null | undefined {
  if (isNil(likeValue)) {
    return likeValue
  }

  const value = from(likeValue)

  if (value.second === 0 && value.millisecond === 0 && value.microsecond === 0 && value.nanosecond === 0) {
    return `${value.hour.toString().padStart(2, '0')}:${value.minute.toString().padStart(2, '0')}` as PlainTimeLiteral
  }

  return value.toString() as PlainTimeLiteral
}

export const SchemaLiteral = structuredTransform(Zod.string(), (it: string) => parseString(it).map((it) => toLiteral(it)))
export const SchemaInstance = structuredTransform(Zod.string(), parseString)

export const isPlainTime = (value: unknown): value is PlainTime => {
  return value instanceof Temporal.PlainTime
}

export const now = (zone: TimeZoneId, clock = DefaultClock): PlainTime => {
  return fromInstant(clock.instant(), zone)
}

export const merge = (element: PlainTimeLike, builder: Partial<PlainTimeBuilder>): PlainTime => {
  return from(element).with(builder)
}

export const add = (element: PlainTimeLike, duration: DurationLike): PlainTime => {
  return from(element).add(_fromDuration(duration))
}

export const subtract = (element: PlainTimeLike, duration: DurationLike): PlainTime => {
  return from(element).subtract(_fromDuration(duration))
}

export const until = (element: PlainTimeLike, other: PlainTimeLike): Duration => {
  return from(element).until(from(other))
}

export const round = (element: PlainTimeLike, unit: TimeUnit): PlainTime => {
  return from(element).round({ smallestUnit: unit })
}

export function isEqual(element: PlainTimeLike, other: PlainTimeLike): boolean
export function isEqual(element: PlainTimeLike | null, other: PlainTimeLike | null): boolean
export function isEqual(element: PlainTimeLike | undefined, other: PlainTimeLike | undefined): boolean
export function isEqual(element: PlainTimeLike | null | undefined, other: PlainTimeLike | null | undefined): boolean {
  if (isNil(element) || isNil(other)) {
    return element === other
  }

  return EqualBy(from(element), from(other))
}

export const isBefore = (element: PlainTimeLike, other: PlainTimeLike): boolean => {
  return CompareBy(from(element), from(other)) < 0
}

export const isAfter = (element: PlainTimeLike, other: PlainTimeLike): boolean => {
  return CompareBy(from(element), from(other)) > 0
}

export type TimeFormatOptions = {
  hour12?: boolean | undefined
  hour?: 'numeric' | '2-digit' | undefined
  minute?: 'numeric' | '2-digit' | undefined
  second?: 'numeric' | '2-digit' | undefined
}

export const format = (element: PlainTimeLike, locale: Locale, options?: TimeFormatOptions): string => {
  const plainTime = from(element)

  // Create a Date at Unix epoch with the time components
  const date = new Date(1970, 0, 1, plainTime.hour, plainTime.minute, plainTime.second, plainTime.millisecond)

  if (isNil(options) || (isNil(options.hour) && isNil(options.minute) && isNil(options.second))) {
    options = { ...options, hour: 'numeric', minute: '2-digit', ...(plainTime.second > 0 || plainTime.millisecond > 0 ? { second: '2-digit' } : {}) }
  }

  const formatter = new Intl.DateTimeFormat(locale, options)
  return formatter.format(date)
}

export const Midnight = from({ hour: 0 })
export const Noon = from({ hour: 12 })
