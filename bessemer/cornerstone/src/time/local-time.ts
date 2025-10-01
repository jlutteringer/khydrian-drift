import * as Durations from '@bessemer/cornerstone/time/duration'
import { Duration } from '@bessemer/cornerstone/time/duration'
import * as Dates from '@bessemer/cornerstone/time/date'
import * as TimeZoneIds from '@bessemer/cornerstone/time/time-zone-id'
import { TimeZoneId } from '@bessemer/cornerstone/time/time-zone-id'
import * as Clocks from '@bessemer/cornerstone/time/clock'
import * as Results from '@bessemer/cornerstone/result'
import { Result } from '@bessemer/cornerstone/result'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { namespace } from '@bessemer/cornerstone/resource-key'
import { NominalType } from '@bessemer/cornerstone/types'
import { padStart } from '@bessemer/cornerstone/string'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'
import Zod from 'zod'

export const Namespace = namespace('local-time')
export type LocalTimeLiteral = NominalType<string, typeof Namespace>

export type LocalTimeInstanceProps = { hour: number; minute: number; second: number; millisecond: number }
export type LocalTimeAugment = Partial<LocalTimeInstanceProps>

export class LocalTime {
  readonly hour: number
  readonly minute: number
  readonly second: number
  readonly millisecond: number
  readonly duration: Duration

  constructor(props: LocalTimeInstanceProps) {
    this.hour = props.hour
    this.minute = props.minute
    this.second = props.second
    this.millisecond = props.millisecond
    this.duration = Durations.sum(
      Durations.fromHours(props.hour),
      Durations.fromMinutes(props.minute),
      Durations.fromSeconds(props.second),
      Durations.fromMilliseconds(props.millisecond)
    )
  }

  toLiteral = (): LocalTimeLiteral => {
    const hourString = padStart(String(this.hour), 2, '0')
    const minuteString = padStart(String(this.minute), 2, '0')
    const secondString = this.second > 0 ? `:${padStart(String(this.second), 2, '0')}` : ''
    const millisecondString = this.millisecond > 0 ? `.${padStart(String(this.millisecond), 3, '0')}` : ''
    return `${hourString}:${minuteString}${secondString}${millisecondString}` as LocalTimeLiteral
  }
}

export type LocalTimeInput = LocalTime | LocalTimeLiteral

export const fromProps = (props: LocalTimeInstanceProps): LocalTime => {
  if (!Number.isInteger(props.hour)) {
    throw new Error(`LocalTime - Hours must be an integer, got ${props.hour}`)
  }

  if (!Number.isInteger(props.minute)) {
    throw new Error(`LocalTime - Minutes must be an integer, got ${props.minute}`)
  }

  if (!Number.isInteger(props.second)) {
    throw new Error(`LocalTime - Seconds must be an integer, got ${props.second}`)
  }

  if (!Number.isInteger(props.millisecond)) {
    throw new Error(`LocalTime - Milliseconds must be an integer, got ${props.millisecond}`)
  }

  if (props.hour < 0 || props.hour > 23) {
    throw new Error(`LocalTime - Hours must be between 0 and 23, got ${props.hour}`)
  }

  if (props.minute < 0 || props.minute > 59) {
    throw new Error(`LocalTime - Minutes must be between 0 and 59, got ${props.minute}`)
  }

  if (props.second < 0 || props.second > 59) {
    throw new Error(`LocalTime - Seconds must be between 0 and 59, got ${props.second}`)
  }

  if (props.millisecond < 0 || props.millisecond > 999) {
    throw new Error(`LocalTime - Milliseconds must be between 0 and 999, got ${props.millisecond}`)
  }

  return new LocalTime(props)
}

export const fromDuration = (duration: Duration): LocalTime => {
  const wrappedMillis = ((duration % Durations.OneDay) + Durations.OneDay) % Durations.OneDay

  const hour = Math.floor(wrappedMillis / Durations.OneHour)
  const minute = Math.floor((wrappedMillis % Durations.OneHour) / Durations.OneMinute)
  const second = Math.floor((wrappedMillis % Durations.OneMinute) / Durations.OneSecond)
  const millisecond = wrappedMillis % Durations.OneSecond

  return new LocalTime({ hour, minute, second, millisecond })
}

export const fromInstant = (instant: Date, zone: TimeZoneId): LocalTime => {
  const offset = TimeZoneIds.getOffset(zone, instant)
  return fromDuration(Durations.fromMilliseconds(instant.getTime() + offset))
}

export const now = (clock = Clocks.Default): LocalTime => {
  return fromInstant(Dates.now(clock), clock.zone)
}

export const parseString = (value: string): Result<LocalTime, ErrorEvent> => {
  const timePattern = /^(\d{1,2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/

  const match = value.match(timePattern)
  if (!match) {
    return Results.failure(invalidValue(value, { namespace: Namespace, message: `LocalTime must be in format H:MM, H:MM:SS, or H:MM:SS.sss.` }))
  }

  const hour = parseInt(match[1]!, 10)
  const minute = parseInt(match[2]!, 10)
  const second = match[3] ? parseInt(match[3], 10) : 0
  let millisecond = 0

  if (match[4]) {
    // Pad or truncate milliseconds to 3 digits
    const msString = match[4].padEnd(3, '0').slice(0, 3)
    millisecond = parseInt(msString, 10)
  }

  // Validate ranges
  if (hour < 0 || hour > 23) {
    return Results.failure(invalidValue(value, { namespace: Namespace, message: `LocalTime - Hours must be between 0 and 23.` }))
  }

  if (minute < 0 || minute > 59) {
    return Results.failure(invalidValue(value, { namespace: Namespace, message: `LocalTime - Minutes must be between 0 and 59.` }))
  }

  if (second < 0 || second > 59) {
    return Results.failure(invalidValue(value, { namespace: Namespace, message: `LocalTime - Seconds must be between 0 and 59.` }))
  }

  if (millisecond < 0 || millisecond > 999) {
    return Results.failure(invalidValue(value, { namespace: Namespace, message: `LocalTime - Milliseconds must be between 0 and 999.` }))
  }

  return Results.success(new LocalTime({ hour, minute, second, millisecond }))
}

export const fromString = (value: string): LocalTime => {
  return unpackResult(parseString(value))
}

export const Schema = structuredTransform(Zod.string(), (it: string) => Results.map(parseString(it), (it) => it.toLiteral()))
export const InstanceSchema = structuredTransform(Zod.string(), parseString)

const asInstance = (value: LocalTimeInput): LocalTime => {
  if (value instanceof LocalTime) {
    return value
  }

  return fromString(value)
}

export const augment = (element: LocalTimeInput, builder: LocalTimeAugment): LocalTime => {
  return new LocalTime({ ...asInstance(element), ...builder })
}

export const addDuration = (element: LocalTimeInput, duration: Duration): LocalTime => {
  return fromDuration(Durations.sum(asInstance(element).duration, duration))
}

export const subtractDuration = (element: LocalTimeInput, duration: Duration): LocalTime => {
  return fromDuration(Durations.subtract(asInstance(element).duration, duration))
}

export const timeBetween = (element: LocalTimeInput, other: LocalTimeInput): Duration => {
  return Durations.subtract(asInstance(other).duration, asInstance(element).duration)
}

export const isBefore = (element: LocalTimeInput, other: LocalTimeInput): boolean => {
  return timeBetween(element, other) > 0
}

export const isAfter = (element: LocalTimeInput, other: LocalTimeInput): boolean => {
  return timeBetween(element, other) < 0
}

export const timeUntil = (element: LocalTimeInput, other: LocalTimeInput): Duration => {
  let duration = asInstance(other).duration
  if (duration < asInstance(element).duration) {
    duration = Durations.sum(duration, Durations.OneDay)
  }

  return Durations.subtract(duration, asInstance(element).duration)
}
