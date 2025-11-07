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
import { PlainTimeBuilder, TimeFormatOptions } from '@bessemer/cornerstone/temporal/plain-time'
import { DateFormatOptions, PlainDateBuilder } from '@bessemer/cornerstone/temporal/plain-date'

export type ZonedDateTime = Temporal.ZonedDateTime
export const Namespace = createNamespace('zoned-date-time')
export type ZonedDateTimeLiteral = NominalType<string, typeof Namespace>
export type ZonedDateTimeBuilder = PlainDateBuilder &
  PlainTimeBuilder & {
    timeZone: TimeZoneId
  }

export type ZonedDateTimeLike = ZonedDateTime | ZonedDateTimeLiteral | ZonedDateTimeBuilder

export function from(value: ZonedDateTimeLike | string): ZonedDateTime
export function from(value: ZonedDateTimeLike | string | null): ZonedDateTime | null
export function from(value: ZonedDateTimeLike | string | undefined): ZonedDateTime | undefined
export function from(value: ZonedDateTimeLike | string | null | undefined): ZonedDateTime | null | undefined
export function from(value: ZonedDateTimeLike | string | null | undefined): ZonedDateTime | null | undefined {
  if (isNil(value)) {
    return value
  }

  if (value instanceof Temporal.ZonedDateTime) {
    return value
  }

  if (isString(value)) {
    return unpackResult(parseString(value))
  }

  return Temporal.ZonedDateTime.from(value)
}

export const CompareBy: Comparator<ZonedDateTime> = (first: ZonedDateTime, second: ZonedDateTime): number =>
  Temporal.PlainDateTime.compare(first, second)
export const EqualBy = fromComparator(CompareBy)

export const parseString = (value: string): Result<ZonedDateTime, ErrorEvent> => {
  try {
    return success(Temporal.ZonedDateTime.from(value))
  } catch (e) {
    if (!isError(e)) {
      throw e
    }

    return failure(invalidValue(value, { namespace: Namespace, message: e.message }))
  }
}

export const fromInstant = (instant: InstantLike, zone: TimeZoneId): ZonedDateTime => {
  return _fromInstant(instant).toZonedDateTimeISO(zone)
}

export function toLiteral(likeValue: ZonedDateTimeLike): ZonedDateTimeLiteral
export function toLiteral(likeValue: ZonedDateTimeLike | null): ZonedDateTimeLiteral | null
export function toLiteral(likeValue: ZonedDateTimeLike | undefined): ZonedDateTimeLiteral | undefined
export function toLiteral(likeValue: ZonedDateTimeLike | null | undefined): ZonedDateTimeLiteral | null | undefined
export function toLiteral(likeValue: ZonedDateTimeLike | null | undefined): ZonedDateTimeLiteral | null | undefined {
  if (isNil(likeValue)) {
    return likeValue
  }

  const value = from(likeValue)
  return value.toString() as ZonedDateTimeLiteral
}

export const SchemaLiteral = structuredTransform(Zod.string(), (it: string) => parseString(it).map(toLiteral))
export const SchemaInstance = structuredTransform(Zod.string(), parseString)

export const isPlainDateTime = (value: unknown): value is ZonedDateTime => {
  return value instanceof Temporal.PlainDateTime
}

export const now = (zone: TimeZoneId, clock = DefaultClock): ZonedDateTime => {
  return fromInstant(clock.instant(), zone)
}

export const merge = (element: ZonedDateTimeLike, builder: Partial<ZonedDateTimeBuilder>): ZonedDateTime => {
  return from(element).with(builder)
}

export const add = (element: ZonedDateTimeLike, duration: DurationLike): ZonedDateTime => {
  return from(element).add(_fromDuration(duration))
}

export const subtract = (element: ZonedDateTimeLike, duration: DurationLike): ZonedDateTime => {
  return from(element).subtract(_fromDuration(duration))
}

export const until = (element: ZonedDateTimeLike, other: ZonedDateTimeLike): Duration => {
  return from(element).until(from(other))
}

export const round = (element: ZonedDateTimeLike, unit: TimeUnit): ZonedDateTime => {
  return from(element).round({ smallestUnit: unit })
}

export function isEqual(element: ZonedDateTimeLike, other: ZonedDateTimeLike): boolean
export function isEqual(element: ZonedDateTimeLike | null, other: ZonedDateTimeLike | null): boolean
export function isEqual(element: ZonedDateTimeLike | undefined, other: ZonedDateTimeLike | undefined): boolean
export function isEqual(element: ZonedDateTimeLike | null | undefined, other: ZonedDateTimeLike | null | undefined): boolean {
  if (isNil(element) || isNil(other)) {
    return element === other
  }

  return EqualBy(from(element), from(other))
}

export const isBefore = (element: ZonedDateTimeLike, other: ZonedDateTimeLike): boolean => {
  return CompareBy(from(element), from(other)) < 0
}

export const isAfter = (element: ZonedDateTimeLike, other: ZonedDateTimeLike): boolean => {
  return CompareBy(from(element), from(other)) > 0
}

export type DateTimeFormatOptions = DateFormatOptions & TimeFormatOptions

// JOHN need to consider what to do about time zone offset vs. time zone id discrepancy
// export const format = (element: ZonedDateTimeLike, locale: Locale, options: DateTimeFormatOptions): string => {
//   const zonedDateTime = from(element)
//
//   // Convert PlainDateTime to Date
//   const date = new Date(
//     zonedDateTime.year,
//     zonedDateTime.month - 1, // Date months are 0-based
//     zonedDateTime.day,
//     zonedDateTime.hour,
//     zonedDateTime.minute,
//     zonedDateTime.second,
//     zonedDateTime.millisecond
//   )
//
//   const formatter = new Intl.DateTimeFormat(locale, { ...options, timeZone: zonedDateTime.timeZoneId })
//   return formatter.format(date)
// }
