import Zod from 'zod'
import { Temporal } from '@js-temporal/polyfill'
import { namespace } from '@bessemer/cornerstone/resource-key'
import { NominalType } from '@bessemer/cornerstone/types'
import { Comparator } from '@bessemer/cornerstone/comparator'
import { fromComparator } from '@bessemer/cornerstone/equalitor'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'
import { failure, mapResult, Result, success } from '@bessemer/cornerstone/result'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { isError } from '@bessemer/cornerstone/error/error'
import { TimeUnit } from '@bessemer/cornerstone/temporal/chrono'
import { isString } from '@bessemer/cornerstone/string'

// JOHN find a way to exclude calendar durations from this? is it worth it?
export type Duration = Temporal.Duration
export const Namespace = namespace('duration')
export type DurationLiteral = NominalType<string, typeof Namespace>
export type DurationBuilder = {
  hours?: number
  minutes?: number
  seconds?: number
  milliseconds?: number
  microseconds?: number
  nanoseconds?: number
}
export type DurationInput = Duration | DurationLiteral | DurationBuilder

export const from = (value: DurationInput): Duration => {
  if (value instanceof Temporal.Duration) {
    return value
  }
  if (isString(value)) {
    return fromString(value)
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

export const fromString = (value: string): Duration => {
  return unpackResult(parseString(value))
}

export const toLiteral = (value: Duration): DurationLiteral => {
  return value.toString() as DurationLiteral
}

export const Schema = structuredTransform(Zod.string(), (it: string) => mapResult(parseString(it), toLiteral))
export const InstanceSchema = structuredTransform(Zod.string(), parseString)

export const isDuration = (value: unknown): value is Duration => {
  return value instanceof Temporal.Duration
}

export const merge = (element: DurationInput, builder: DurationBuilder): Duration => {
  return from(element).with(builder)
}

export const fromMilliseconds = (value: number): Duration => {
  return from({ milliseconds: value })
}

export const toMilliseconds = (duration: DurationInput): number => {
  return from(duration).total(TimeUnit.Millisecond)
}

export const fromSeconds = (value: number): Duration => {
  return from({ seconds: value })
}

export const toSeconds = (duration: DurationInput): number => {
  return from(duration).total(TimeUnit.Second)
}

export const fromMinutes = (value: number): Duration => {
  return from({ minutes: value })
}

export const toMinutes = (duration: DurationInput): number => {
  return from(duration).total(TimeUnit.Minute)
}

export const fromHours = (value: number): Duration => {
  return from({ hours: value })
}

export const toHours = (duration: DurationInput): number => {
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

export const toUnit = (duration: DurationInput, timeUnit: TimeUnit): number => {
  return from(duration).total(timeUnit)
}

export const isZero = (duration: DurationInput): boolean => {
  return EqualBy(from(duration), Zero)
}

export const round = (element: DurationInput, unit: TimeUnit): Duration => {
  return from(element).round({ smallestUnit: unit })
}

export const add = (...durations: Array<DurationInput>): Duration => {
  return durations.map(from).reduce((first, second) => first.add(second), Zero)
}

export const subtract = (...durations: Array<DurationInput>): Duration => {
  if (durations.length === 0) {
    return Zero
  }

  const instances = durations.map(from)
  return instances.slice(1).reduce((result, current) => result.subtract(current), instances[0]!)
}

export const negate = (element: DurationInput): Duration => {
  return from(element).negated()
}

export const isEqual = (element: DurationInput, other: DurationInput): boolean => {
  return EqualBy(from(element), from(other))
}

export const isLess = (element: DurationInput, other: DurationInput): boolean => {
  return CompareBy(from(element), from(other)) < 0
}

export const isGreater = (element: DurationInput, other: DurationInput): boolean => {
  return CompareBy(from(element), from(other)) > 0
}

export const Zero = from({ nanoseconds: 0 })
export const OneMillisecond = fromMilliseconds(1)
export const OneSecond = fromSeconds(1)
export const OneMinute = fromMinutes(1)
export const OneHour = fromHours(1)
export const OneDay = fromHours(24)
