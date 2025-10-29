import { Temporal } from '@js-temporal/polyfill'
import { createNamespace } from '@bessemer/cornerstone/resource-key'
import { NominalType } from '@bessemer/cornerstone/types'
import { Comparator } from '@bessemer/cornerstone/comparator'
import { fromComparator } from '@bessemer/cornerstone/equalitor'
import { failure, mapResult, Result, success } from '@bessemer/cornerstone/result'
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
import { Locale } from '@bessemer/cornerstone/intl/locale'
import { DateFormatOptions, PlainDateBuilder } from '@bessemer/cornerstone/temporal/plain-date'

export type PlainDateTime = Temporal.PlainDateTime
export const Namespace = createNamespace('plain-date-time')
export type PlainDateTimeLiteral = NominalType<string, typeof Namespace>
export type PlainDateTimeBuilder = PlainDateBuilder & PlainTimeBuilder

export type PlainDateTimeLike = PlainDateTime | PlainDateTimeLiteral | PlainDateTimeBuilder

export function from(value: PlainDateTimeLike | string): PlainDateTime
export function from(value: PlainDateTimeLike | string | null): PlainDateTime | null
export function from(value: PlainDateTimeLike | string | undefined): PlainDateTime | undefined
export function from(value: PlainDateTimeLike | string | null | undefined): PlainDateTime | null | undefined
export function from(value: PlainDateTimeLike | string | null | undefined): PlainDateTime | null | undefined {
  if (isNil(value)) {
    return value
  }

  if (value instanceof Temporal.PlainDateTime) {
    return value
  }

  if (isString(value)) {
    return unpackResult(parseString(value))
  }

  return Temporal.PlainDateTime.from(value)
}

export const CompareBy: Comparator<PlainDateTime> = (first: PlainDateTime, second: PlainDateTime): number =>
  Temporal.PlainDateTime.compare(first, second)
export const EqualBy = fromComparator(CompareBy)

export const parseString = (value: string): Result<PlainDateTime, ErrorEvent> => {
  try {
    return success(Temporal.PlainDateTime.from(value))
  } catch (e) {
    if (!isError(e)) {
      throw e
    }

    return failure(invalidValue(value, { namespace: Namespace, message: e.message }))
  }
}

export const fromInstant = (instant: InstantLike, zone: TimeZoneId): PlainDateTime => {
  return _fromInstant(instant).toZonedDateTimeISO(zone).toPlainDateTime()
}

export function toLiteral(likeValue: PlainDateTimeLike): PlainDateTimeLiteral
export function toLiteral(likeValue: PlainDateTimeLike | null): PlainDateTimeLiteral | null
export function toLiteral(likeValue: PlainDateTimeLike | undefined): PlainDateTimeLiteral | undefined
export function toLiteral(likeValue: PlainDateTimeLike | null | undefined): PlainDateTimeLiteral | null | undefined
export function toLiteral(likeValue: PlainDateTimeLike | null | undefined): PlainDateTimeLiteral | null | undefined {
  if (isNil(likeValue)) {
    return likeValue
  }

  const value = from(likeValue)
  return value.toString() as PlainDateTimeLiteral
}

export const SchemaLiteral = structuredTransform(Zod.string(), (it: string) => mapResult(parseString(it), (it) => toLiteral(it)))
export const SchemaInstance = structuredTransform(Zod.string(), parseString)

export const isPlainDateTime = (value: unknown): value is PlainDateTime => {
  return value instanceof Temporal.PlainDateTime
}

export const now = (zone: TimeZoneId, clock = DefaultClock): PlainDateTime => {
  return fromInstant(clock.instant(), zone)
}

export const merge = (element: PlainDateTimeLike, builder: PlainDateTimeBuilder): PlainDateTime => {
  return from(element).with(builder)
}

export const add = (element: PlainDateTimeLike, duration: DurationLike): PlainDateTime => {
  return from(element).add(_fromDuration(duration))
}

export const subtract = (element: PlainDateTimeLike, duration: DurationLike): PlainDateTime => {
  return from(element).subtract(_fromDuration(duration))
}

export const until = (element: PlainDateTimeLike, other: PlainDateTimeLike): Duration => {
  return from(element).until(from(other))
}

export const round = (element: PlainDateTimeLike, unit: TimeUnit): PlainDateTime => {
  return from(element).round({ smallestUnit: unit })
}

export function isEqual(element: PlainDateTimeLike, other: PlainDateTimeLike): boolean
export function isEqual(element: PlainDateTimeLike | null, other: PlainDateTimeLike | null): boolean
export function isEqual(element: PlainDateTimeLike | undefined, other: PlainDateTimeLike | undefined): boolean
export function isEqual(element: PlainDateTimeLike | null | undefined, other: PlainDateTimeLike | null | undefined): boolean {
  if (isNil(element) || isNil(other)) {
    return element === other
  }

  return EqualBy(from(element), from(other))
}

export const isBefore = (element: PlainDateTimeLike, other: PlainDateTimeLike): boolean => {
  return CompareBy(from(element), from(other)) < 0
}

export const isAfter = (element: PlainDateTimeLike, other: PlainDateTimeLike): boolean => {
  return CompareBy(from(element), from(other)) > 0
}

export type DateTimeFormatOptions = DateFormatOptions & TimeFormatOptions

export const format = (element: PlainDateTimeLike, locale: Locale, options: DateTimeFormatOptions): string => {
  const plainDateTime = from(element)

  // Convert PlainDateTime to Date
  const date = new Date(
    plainDateTime.year,
    plainDateTime.month - 1, // Date months are 0-based
    plainDateTime.day,
    plainDateTime.hour,
    plainDateTime.minute,
    plainDateTime.second,
    plainDateTime.millisecond
  )

  const formatter = new Intl.DateTimeFormat(locale, options)
  return formatter.format(date)
}
