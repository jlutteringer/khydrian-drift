import Zod from 'zod'
import { Temporal } from '@js-temporal/polyfill'
import { createNamespace } from '@bessemer/cornerstone/resource-key'
import { NominalType } from '@bessemer/cornerstone/types'
import { Comparator } from '@bessemer/cornerstone/comparator'
import { fromComparator } from '@bessemer/cornerstone/equalitor'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'
import { failure, Result, success } from '@bessemer/cornerstone/result'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { isError } from '@bessemer/cornerstone/error/error'
import { TimeUnit } from '@bessemer/cornerstone/temporal/chrono'
import { isString } from '@bessemer/cornerstone/string'
import { isNil } from '@bessemer/cornerstone/object'

export type Duration = Temporal.Duration
export const Namespace = createNamespace('duration')
export type DurationLiteral = NominalType<string, typeof Namespace>
export type DurationBuilder = {
  hours?: number
  minutes?: number
  seconds?: number
  milliseconds?: number
  microseconds?: number
  nanoseconds?: number
}
export type DurationLike = Duration | DurationLiteral | DurationBuilder

export function from(value: DurationLike | string): Duration
export function from(value: DurationLike | string | null): Duration | null
export function from(value: DurationLike | string | undefined): Duration | undefined
export function from(value: DurationLike | string | null | undefined): Duration | null | undefined
export function from(value: DurationLike | string | null | undefined): Duration | null | undefined {
  if (isNil(value)) {
    return value
  }

  if (value instanceof Temporal.Duration) {
    return value
  }
  if (isString(value)) {
    return unpackResult(parseString(value))
  }

  return Temporal.Duration.from(value)
}

export const CompareBy: Comparator<Duration> = (first: Duration, second: Duration): number => Temporal.Duration.compare(first, second)
export const EqualBy = fromComparator(CompareBy)

export const parseString = (value: string): Result<Duration, ErrorEvent> => {
  try {
    return success(Temporal.Duration.from(value))
  } catch (e) {
    if (!isError(e)) {
      throw e
    }

    return failure(invalidValue(value, { namespace: Namespace, message: e.message }))
  }
}

export function toLiteral(value: DurationLike): DurationLiteral
export function toLiteral(value: DurationLike | null): DurationLiteral | null
export function toLiteral(value: DurationLike | undefined): DurationLiteral | undefined
export function toLiteral(value: DurationLike | null | undefined): DurationLiteral | null | undefined
export function toLiteral(value: DurationLike | null | undefined): DurationLiteral | null | undefined {
  if (isNil(value)) {
    return value
  }

  return from(value).toString() as DurationLiteral
}

export const SchemaLiteral = structuredTransform(Zod.string(), (it: string) => parseString(it).map((it) => toLiteral(it)))
export const SchemaInstance = structuredTransform(Zod.string(), parseString)

export const isDuration = (value: unknown): value is Duration => {
  return value instanceof Temporal.Duration
}

export const merge = (element: DurationLike, builder: DurationBuilder): Duration => {
  return from(element).with(builder)
}

export const fromMilliseconds = (value: number): Duration => {
  return from({ milliseconds: value })
}

export const toMilliseconds = (duration: DurationLike): number => {
  return from(duration).total(TimeUnit.Millisecond)
}

export const fromSeconds = (value: number): Duration => {
  return from({ seconds: value })
}

export const toSeconds = (duration: DurationLike): number => {
  return from(duration).total(TimeUnit.Second)
}

export const fromMinutes = (value: number): Duration => {
  return from({ minutes: value })
}

export const toMinutes = (duration: DurationLike): number => {
  return from(duration).total(TimeUnit.Minute)
}

export const fromHours = (value: number): Duration => {
  return from({ hours: value })
}

export const toHours = (duration: DurationLike): number => {
  return from(duration).total(TimeUnit.Hour)
}

export const fromUnit = (value: number, timeUnit: TimeUnit): Duration => {
  switch (timeUnit) {
    case TimeUnit.Nanosecond:
      return from({ nanoseconds: value })
    case TimeUnit.Microsecond:
      return from({ microseconds: value })
    case TimeUnit.Millisecond:
      return from({ milliseconds: value })
    case TimeUnit.Second:
      return from({ seconds: value })
    case TimeUnit.Minute:
      return from({ minutes: value })
    case TimeUnit.Hour:
      return from({ hours: value })
  }
}

export const toUnit = (duration: DurationLike, timeUnit: TimeUnit): number => {
  return from(duration).total(timeUnit)
}

export const isZero = (duration: DurationLike): boolean => {
  return EqualBy(from(duration), Zero)
}

export const round = (element: DurationLike, unit: TimeUnit): Duration => {
  return from(element).round({ smallestUnit: unit })
}

export const add = (...durations: Array<DurationLike>): Duration => {
  return durations.map((it) => from(it)).reduce((first, second) => first.add(second), Zero)
}

export const subtract = (...durations: Array<DurationLike>): Duration => {
  if (durations.length === 0) {
    return Zero
  }

  const instances = durations.map((it) => from(it))
  return instances.slice(1).reduce((result, current) => result.subtract(current), instances[0]!)
}

export const negate = (element: DurationLike): Duration => {
  return from(element).negated()
}

export function isEqual(element: DurationLike, other: DurationLike): boolean
export function isEqual(element: DurationLike | null, other: DurationLike | null): boolean
export function isEqual(element: DurationLike | undefined, other: DurationLike | undefined): boolean
export function isEqual(element: DurationLike | null | undefined, other: DurationLike | null | undefined): boolean {
  if (isNil(element) || isNil(other)) {
    return element === other
  }

  return EqualBy(from(element), from(other))
}

export const isLess = (element: DurationLike, other: DurationLike): boolean => {
  return CompareBy(from(element), from(other)) < 0
}

export const isGreater = (element: DurationLike, other: DurationLike): boolean => {
  return CompareBy(from(element), from(other)) > 0
}

export const Zero = from({ nanoseconds: 0 })
export const OneMillisecond = fromMilliseconds(1)
export const OneSecond = fromSeconds(1)
export const OneMinute = fromMinutes(1)
export const OneHour = fromHours(1)
export const OneDay = fromHours(24)
