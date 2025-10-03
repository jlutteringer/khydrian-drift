import { ValueOf } from 'type-fest'
import { Instant, InstantLiteral } from '@bessemer/cornerstone/temporal/instant'
import { Temporal } from '@js-temporal/polyfill'

export const TimeUnit = {
  Hour: 'hour',
  Minute: 'minute',
  Second: 'second',
  Millisecond: 'millisecond',
  Microsecond: 'microsecond',
  Nanosecond: 'nanosecond',
} as const

export type TimeUnit = ValueOf<typeof TimeUnit>

export const DateUnit = {
  Year: 'year',
  Month: 'month',
  Week: 'week',
  Day: 'day',
} as const

export type DateUnit = ValueOf<typeof DateUnit>

export const ChronoUnit = {
  ...TimeUnit,
  ...DateUnit,
} as const

export type ChronoUnit = ValueOf<typeof ChronoUnit>

// These methods are here to avoid circular dependencies
export const _toLiteral = (value: Instant): InstantLiteral => {
  return value.toJSON() as InstantLiteral
}

export const _isInstant = (value: unknown): value is Instant => {
  return value instanceof Temporal.Instant
}
