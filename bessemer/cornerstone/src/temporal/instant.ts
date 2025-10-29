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
import { Duration, DurationLike, from as fromDuration } from '@bessemer/cornerstone/temporal/duration'
import { _isInstant, instantToLiteral, TimeUnit } from '@bessemer/cornerstone/temporal/chrono'
import { isString } from '@bessemer/cornerstone/string'
import { isNil } from '@bessemer/cornerstone/object'
import { Locale } from '@bessemer/cornerstone/intl/locale'
import { DateTimeFormatOptions, format as formatPlainDateTime, fromInstant } from '@bessemer/cornerstone/temporal/plain-date-time'
import { TimeZoneId } from '@bessemer/cornerstone/temporal/time-zone-id'

export type Instant = Temporal.Instant
export const Namespace = createNamespace('instant')
export type InstantLiteral = NominalType<string, typeof Namespace>
export type InstantLike = Instant | Date | InstantLiteral

export function from(value: InstantLike | string): Instant
export function from(value: InstantLike | string | null): Instant | null
export function from(value: InstantLike | string | undefined): Instant | undefined
export function from(value: InstantLike | string | null | undefined): Instant | null | undefined
export function from(value: InstantLike | string | null | undefined): Instant | null | undefined {
  if (isNil(value)) {
    return value
  }

  if (value instanceof Temporal.Instant) {
    return value
  }
  if (isString(value)) {
    return unpackResult(parseString(value))
  }

  return Temporal.Instant.fromEpochMilliseconds(value.getTime())
}

export const CompareBy: Comparator<Instant> = (first: Instant, second: Instant): number => Temporal.Instant.compare(first, second)
export const EqualBy = fromComparator(CompareBy)

export const parseString = (value: string): Result<Instant, ErrorEvent> => {
  try {
    return success(Temporal.Instant.from(value))
  } catch (e) {
    if (!isError(e)) {
      throw e
    }

    return failure(invalidValue(value, { namespace: Namespace, message: e.message }))
  }
}

export function toLiteral(value: InstantLike): InstantLiteral
export function toLiteral(value: InstantLike | null): InstantLiteral | null
export function toLiteral(value: InstantLike | undefined): InstantLiteral | undefined
export function toLiteral(value: InstantLike | null | undefined): InstantLiteral | null | undefined
export function toLiteral(value: InstantLike | null | undefined): InstantLiteral | null | undefined {
  if (isNil(value)) {
    return value
  }

  return instantToLiteral(from(value))
}

export function toDate(value: InstantLike): Date
export function toDate(value: InstantLike | null): Date | null
export function toDate(value: InstantLike | undefined): Date | undefined
export function toDate(value: InstantLike | null | undefined): Date | null | undefined
export function toDate(value: InstantLike | null | undefined): Date | null | undefined {
  if (isNil(value)) {
    return value
  }

  return new Date(from(value).epochMilliseconds)
}

export const SchemaLiteral = structuredTransform(Zod.string(), (it: string) => mapResult(parseString(it), (it) => toLiteral(it)))
export const SchemaInstance = structuredTransform(Zod.string(), parseString)

export const isInstant = _isInstant

export const now = (clock = DefaultClock): Instant => {
  return clock.instant()
}

export const add = (element: InstantLike, duration: DurationLike): Instant => {
  return from(element).add(fromDuration(duration))
}

export const subtract = (element: InstantLike, duration: DurationLike): Instant => {
  return from(element).subtract(fromDuration(duration))
}

export const until = (element: InstantLike, other: InstantLike): Duration => {
  return from(element).until(from(other))
}

export const round = (element: InstantLike, unit: TimeUnit): Instant => {
  return from(element).round({ smallestUnit: unit })
}

export function isEqual(element: InstantLike, other: InstantLike): boolean
export function isEqual(element: InstantLike | null, other: InstantLike | null): boolean
export function isEqual(element: InstantLike | undefined, other: InstantLike | undefined): boolean
export function isEqual(element: InstantLike | null | undefined, other: InstantLike | null | undefined): boolean {
  if (isNil(element) || isNil(other)) {
    return element === other
  }

  return EqualBy(from(element), from(other))
}

export const isBefore = (element: InstantLike, other: InstantLike): boolean => {
  return CompareBy(from(element), from(other)) < 0
}

export const isAfter = (element: InstantLike, other: InstantLike): boolean => {
  return CompareBy(from(element), from(other)) > 0
}

export const format = (element: InstantLike, timeZone: TimeZoneId, locale: Locale, options: DateTimeFormatOptions): string => {
  const plainDateTime = fromInstant(from(element), timeZone)
  return formatPlainDateTime(plainDateTime, locale, options)
}
