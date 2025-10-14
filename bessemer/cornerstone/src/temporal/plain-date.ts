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
import { isString } from '@bessemer/cornerstone/string'
import { isNil } from '@bessemer/cornerstone/object'
import { Locale } from '@bessemer/cornerstone/intl/locale'

export type PlainDate = Temporal.PlainDate
export const Namespace = createNamespace('plain-date')
export type PlainDateLiteral = NominalType<string, typeof Namespace>
export type PlainDateBuilder = {
  year: number
  month: number
  day: number
}

export type PlainDateLike = PlainDate | PlainDateLiteral | PlainDateBuilder

export function from(value: PlainDateLike): PlainDate
export function from(value: PlainDateLike | null): PlainDate | null
export function from(value: PlainDateLike | undefined): PlainDate | undefined
export function from(value: PlainDateLike | null | undefined): PlainDate | null | undefined
export function from(value: PlainDateLike | null | undefined): PlainDate | null | undefined {
  if (isNil(value)) {
    return value
  }

  if (value instanceof Temporal.PlainDate) {
    return value
  }

  if (isString(value)) {
    return fromString(value)
  }

  return Temporal.PlainDate.from(value)
}

export const CompareBy: Comparator<PlainDate> = (first: PlainDate, second: PlainDate): number => Temporal.PlainDateTime.compare(first, second)
export const EqualBy = fromComparator(CompareBy)

export const parseString = (value: string): Result<PlainDate, ErrorEvent> => {
  try {
    return success(Temporal.PlainDate.from(value))
  } catch (e) {
    if (!isError(e)) {
      throw e
    }

    return failure(invalidValue(value, { namespace: Namespace, message: e.message }))
  }
}

export const fromString = (value: string): PlainDate => {
  return unpackResult(parseString(value))
}

export const fromInstant = (instant: InstantLike, zone: TimeZoneId): PlainDate => {
  return _fromInstant(instant).toZonedDateTimeISO(zone).toPlainDate()
}

export function toLiteral(likeValue: PlainDateLike): PlainDateLiteral
export function toLiteral(likeValue: PlainDateLike | null): PlainDateLiteral | null
export function toLiteral(likeValue: PlainDateLike | undefined): PlainDateLiteral | undefined
export function toLiteral(likeValue: PlainDateLike | null | undefined): PlainDateLiteral | null | undefined
export function toLiteral(likeValue: PlainDateLike | null | undefined): PlainDateLiteral | null | undefined {
  if (isNil(likeValue)) {
    return likeValue
  }

  const value = from(likeValue)
  return value.toString() as PlainDateLiteral
}

export const SchemaLiteral = structuredTransform(Zod.string(), (it: string) => mapResult(parseString(it), (it) => toLiteral(it)))
export const SchemaInstance = structuredTransform(Zod.string(), parseString)

export const isPlainDateTime = (value: unknown): value is PlainDate => {
  return value instanceof Temporal.PlainDateTime
}

export const now = (zone: TimeZoneId, clock = DefaultClock): PlainDate => {
  return fromInstant(clock.instant(), zone)
}

export const merge = (element: PlainDateLike, builder: Partial<PlainDateBuilder>): PlainDate => {
  return from(element).with(builder)
}

export const add = (element: PlainDateLike, duration: DurationLike): PlainDate => {
  return from(element).add(_fromDuration(duration))
}

export const subtract = (element: PlainDateLike, duration: DurationLike): PlainDate => {
  return from(element).subtract(_fromDuration(duration))
}

export const until = (element: PlainDateLike, other: PlainDateLike): Duration => {
  return from(element).until(from(other))
}

export function isEqual(element: PlainDateLike, other: PlainDateLike): boolean
export function isEqual(element: PlainDateLike | null, other: PlainDateLike | null): boolean
export function isEqual(element: PlainDateLike | undefined, other: PlainDateLike | undefined): boolean
export function isEqual(element: PlainDateLike | null | undefined, other: PlainDateLike | null | undefined): boolean {
  if (isNil(element) || isNil(other)) {
    return element === other
  }

  return EqualBy(from(element), from(other))
}

export const isBefore = (element: PlainDateLike, other: PlainDate): boolean => {
  return CompareBy(from(element), from(other)) < 0
}

export const isAfter = (element: PlainDateLike, other: PlainDate): boolean => {
  return CompareBy(from(element), from(other)) > 0
}

export type DateFormatOptions = {
  era?: 'long' | 'short' | 'narrow' | undefined
  weekday?: 'long' | 'short' | 'narrow' | undefined
  year?: 'numeric' | '2-digit' | undefined
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow' | undefined
  day?: 'numeric' | '2-digit' | undefined
}

export const format = (element: PlainDateLike, locale: Locale, options: DateFormatOptions): string => {
  const plainDate = from(element)

  // Convert PlainDateTime to Date
  const date = new Date(
    plainDate.year,
    plainDate.month - 1, // Date months are 0-based
    plainDate.day
  )

  const formatter = new Intl.DateTimeFormat(locale, options)
  return formatter.format(date)
}
