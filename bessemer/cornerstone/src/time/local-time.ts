import { TaggedType } from '@bessemer/cornerstone/types'
import Zod from 'zod'
import { Duration } from '@bessemer/cornerstone/time/duration'
import { LocalTimeInstance, LocalTimeInstanceProps } from '@bessemer/cornerstone/time/LocalTimeInstance'
import { namespace } from '@bessemer/cornerstone/resource-key'
import { map, Result } from '@bessemer/cornerstone/result'
import { ErrorEvent, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { padStart } from '@bessemer/cornerstone/string'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'
import { Clock, Default as DefaultClock } from '@bessemer/cornerstone/time/clock'
import { TimeZoneId } from '@bessemer/cornerstone/time/time-zone-id'

export const Namespace = namespace('local-time')
export type LocalTime = TaggedType<string, typeof Namespace>

export const fromInstance = (value: LocalTimeInstance): LocalTime => {
  return `${padStart(String(value.hour), 2, '0')}:${padStart(String(value.minute), 2, '0')}:${padStart(String(value.second), 2, '0')}${
    value.millisecond > 0 ? `.${padStart(String(value.millisecond), 3, '0')}` : ''
  }`
}

export const parseString = (value: string): Result<LocalTime, ErrorEvent> => {
  return map(LocalTimeInstance.parseString(value), fromInstance)
}

export const fromString = (value: string): LocalTime => {
  return unpackResult(parseString(value))
}

export const Schema = structuredTransform(Zod.string(), parseString)

export const asInstance = (value: LocalTime | LocalTimeInstance): LocalTimeInstance => {
  if (value instanceof LocalTimeInstance) {
    return value
  }

  return LocalTimeInstance.fromString(value)
}

export const now = (clock: Clock = DefaultClock): LocalTime => {
  return fromInstance(LocalTimeInstance.now(clock))
}

export const fromProps = (props: LocalTimeInstanceProps): LocalTime => {
  return fromInstance(LocalTimeInstance.fromProps(props))
}

export const fromInstant = (instant: Date, zone: TimeZoneId): LocalTime => {
  return fromInstance(LocalTimeInstance.fromInstant(instant, zone))
}

export const fromDuration = (duration: Duration): LocalTime => {
  return fromInstance(LocalTimeInstance.fromDuration(duration))
}

export const addDuration = (time: LocalTime, duration: Duration): LocalTime => {
  return fromInstance(asInstance(time).addDuration(duration))
}

export const subtractDuration = (time: LocalTime, duration: Duration): LocalTime => {
  return fromInstance(asInstance(time).subtractDuration(duration))
}

export const timeBetween = (first: LocalTime, second: LocalTime): Duration => {
  return asInstance(first).timeBetween(asInstance(second))
}

export const isBefore = (time: LocalTime, other: LocalTime): boolean => {
  return asInstance(time).isBefore(asInstance(other))
}

export const isAfter = (time: LocalTime, other: LocalTime): boolean => {
  return asInstance(time).isAfter(asInstance(other))
}

export const timeUntil = (time: LocalTime, other: LocalTime): Duration => {
  return asInstance(time).timeUntil(asInstance(other))
}
