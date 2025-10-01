import { TaggedType } from '@bessemer/cornerstone/types'
import Zod from 'zod'
import { Duration } from '@bessemer/cornerstone/time/duration'
import { LocalTimeInstance } from '@bessemer/cornerstone/time/LocalTimeInstance'
import { namespace } from '@bessemer/cornerstone/resource-key'
import { map, Result } from '@bessemer/cornerstone/result'
import { ErrorEvent, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { padStart } from '@bessemer/cornerstone/string'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'
import { Clock, Default as DefaultClock } from '@bessemer/cornerstone/time/clock'

export const Namespace = namespace('local-time')
export type LocalTime = TaggedType<string, typeof Namespace>

export const fromInstance = (value: LocalTimeInstance): LocalTime => {
  return `${value.hour}:${padStart(String(value.minute), 2, '0')}${value.second > 0 ? `:${padStart(String(value.second), 2, '0')}` : ''}${
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

export const addDuration = (time: LocalTime | LocalTimeInstance, duration: Duration): LocalTime => {
  return fromInstance(asInstance(time).addDuration(duration))
}

export const subtractDuration = (time: LocalTime | LocalTimeInstance, duration: Duration): LocalTime => {
  return fromInstance(asInstance(time).subtractDuration(duration))
}

export const timeBetween = (first: LocalTime | LocalTimeInstance, second: LocalTime | LocalTimeInstance): Duration => {
  return asInstance(first).timeBetween(asInstance(second))
}

export const isBefore = (time: LocalTime | LocalTimeInstance, duration: Duration): LocalTime => {
  return fromInstance(asInstance(time).addDuration(duration))
}

export const isAfter = (time: LocalTime | LocalTimeInstance, duration: Duration): LocalTime => {
  return fromInstance(asInstance(time).addDuration(duration))
}
