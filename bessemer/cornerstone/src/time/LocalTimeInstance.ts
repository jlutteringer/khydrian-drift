import * as Durations from '@bessemer/cornerstone/time/duration'
import { Duration } from '@bessemer/cornerstone/time/duration'
import * as Dates from '@bessemer/cornerstone/time/date'
import * as TimeZoneIds from '@bessemer/cornerstone/time/time-zone-id'
import { TimeZoneId } from '@bessemer/cornerstone/time/time-zone-id'
import * as Clocks from '@bessemer/cornerstone/time/clock'

import { failure, Result, success } from '@bessemer/cornerstone/result'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { Namespace } from '@bessemer/cornerstone/time/local-time'

export type LocalTimeInstanceProps = { hour: number; minute: number; second: number; millisecond: number }
export type LocalTimeAugment = Partial<LocalTimeInstanceProps>

export class LocalTimeInstance {
  readonly duration: Duration

  constructor(readonly hour: number, readonly minute: number, readonly second: number, readonly millisecond: number) {
    this.duration = Durations.sum(
      Durations.fromHours(this.hour),
      Durations.fromMinutes(this.minute),
      Durations.fromSeconds(this.second),
      Durations.fromMilliseconds(this.millisecond)
    )
  }

  static now = (clock = Clocks.Default): LocalTimeInstance => {
    return LocalTimeInstance.fromInstant(Dates.now(clock), clock.zone)
  }

  static fromProps = (props: LocalTimeInstanceProps): LocalTimeInstance => {
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

    return new LocalTimeInstance(props.hour, props.minute, props.second, props.millisecond)
  }

  static fromInstant = (instant: Date, zone: TimeZoneId): LocalTimeInstance => {
    const offset = TimeZoneIds.getOffset(zone, instant)
    return LocalTimeInstance.fromDuration(Durations.fromMilliseconds(instant.getTime() + offset))
  }

  static fromDuration = (duration: Duration): LocalTimeInstance => {
    const wrappedMillis = ((duration % Durations.OneDay) + Durations.OneDay) % Durations.OneDay

    const newHour = Math.floor(wrappedMillis / Durations.OneHour)
    const newMinute = Math.floor((wrappedMillis % Durations.OneHour) / Durations.OneMinute)
    const newSecond = Math.floor((wrappedMillis % Durations.OneMinute) / Durations.OneSecond)
    const newMillisecond = wrappedMillis % Durations.OneSecond

    return new LocalTimeInstance(newHour, newMinute, newSecond, newMillisecond)
  }

  static parseString = (value: string): Result<LocalTimeInstance, ErrorEvent> => {
    const timePattern = /^(\d{1,2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/

    const match = value.match(timePattern)
    if (!match) {
      return failure(invalidValue(value, { namespace: Namespace, message: `LocalTime must be in format H:MM, H:MM:SS, or H:MM:SS.sss.` }))
    }

    const hours = parseInt(match[1]!, 10)
    const minutes = parseInt(match[2]!, 10)
    const seconds = match[3] ? parseInt(match[3], 10) : 0
    let milliseconds = 0

    if (match[4]) {
      // Pad or truncate milliseconds to 3 digits
      const msString = match[4].padEnd(3, '0').slice(0, 3)
      milliseconds = parseInt(msString, 10)
    }

    // Validate ranges
    if (hours < 0 || hours > 23) {
      return failure(invalidValue(value, { namespace: Namespace, message: `LocalTime - Hours must be between 0 and 23.` }))
    }

    if (minutes < 0 || minutes > 59) {
      return failure(invalidValue(value, { namespace: Namespace, message: `LocalTime - Minutes must be between 0 and 59.` }))
    }

    if (seconds < 0 || seconds > 59) {
      return failure(invalidValue(value, { namespace: Namespace, message: `LocalTime - Seconds must be between 0 and 59.` }))
    }

    if (milliseconds < 0 || milliseconds > 999) {
      return failure(invalidValue(value, { namespace: Namespace, message: `LocalTime - Milliseconds must be between 0 and 999.` }))
    }

    return success(new LocalTimeInstance(hours, minutes, seconds, milliseconds))
  }

  static fromString = (value: string): LocalTimeInstance => {
    return unpackResult(LocalTimeInstance.parseString(value))
  }

  augment = (builder: LocalTimeAugment): LocalTimeInstance => {
    return new LocalTimeInstance(
      builder.hour ?? this.hour,
      builder.minute ?? this.minute,
      builder.second ?? this.second,
      builder.millisecond ?? this.millisecond
    )
  }

  addDuration = (duration: Duration): LocalTimeInstance => {
    return LocalTimeInstance.fromDuration(Durations.sum(this.duration, duration))
  }

  subtractDuration = (duration: Duration): LocalTimeInstance => {
    return LocalTimeInstance.fromDuration(Durations.subtract(this.duration, duration))
  }

  timeBetween = (other: LocalTimeInstance): Duration => {
    return Durations.subtract(other.duration, this.duration)
  }

  isBefore = (other: LocalTimeInstance): boolean => {
    return this.timeBetween(other) > 0
  }

  isAfter = (other: LocalTimeInstance): boolean => {
    return this.timeBetween(other) < 0
  }

  timeUntil = (other: LocalTimeInstance): Duration => {
    let duration = other.duration
    if (duration < this.duration) {
      duration = Durations.sum(duration, Durations.OneDay)
    }

    return Durations.subtract(duration, this.duration)
  }
}
