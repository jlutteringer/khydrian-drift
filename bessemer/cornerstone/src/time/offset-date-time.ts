import { getOffset, TimeZoneId } from '@bessemer/cornerstone/time/time-zone-id'
import { Duration } from '@bessemer/cornerstone/time/duration'
import * as Clocks from '@bessemer/cornerstone/time/clock'
import * as Dates from '@bessemer/cornerstone/time/date'
import * as TimeZoneOffsets from '@bessemer/cornerstone/time/time-zone-offset'
import { TimeZoneOffset } from '@bessemer/cornerstone/time/time-zone-offset'
import * as Results from '@bessemer/cornerstone/result'
import { failure, Result, success } from '@bessemer/cornerstone/result'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { isNil } from '@bessemer/cornerstone/object'
import { namespace } from '@bessemer/cornerstone/resource-key'
import { TaggedType } from '@bessemer/cornerstone/types'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'
import Zod from 'zod'

export const Namespace = namespace('offset-date-time')
export type OffsetDateTimeLiteral = TaggedType<string, typeof Namespace>

export class OffsetDateTime {
  constructor(readonly instant: Date, readonly offset: TimeZoneOffset) {}

  toLiteral = (): OffsetDateTimeLiteral => {
    const adjustedDate = new Date(this.instant.getTime() + TimeZoneOffsets.toMilliseconds(this.offset))
    const isoString = adjustedDate.toISOString()
    const offsetString = TimeZoneOffsets.toString(this.offset)
    return isoString.replace('Z', offsetString) as OffsetDateTimeLiteral
  }
}

export type OffsetDateTimeInput = OffsetDateTime | OffsetDateTimeLiteral

export const fromInstant = (instant: Date, zone: TimeZoneId): OffsetDateTime => {
  return new OffsetDateTime(instant, getOffset(zone, instant))
}

export const now = (clock = Clocks.Default): OffsetDateTime => {
  return fromInstant(Dates.now(clock), clock.zone)
}

export const parseString = (value: string): Result<OffsetDateTime, ErrorEvent> => {
  const instantResult = Dates.parseString(value)
  if (!instantResult.isSuccess) {
    return instantResult
  }

  const offsetMatch = value.match(/([+-]\d{2}:?\d{2}|Z)$/)
  if (isNil(offsetMatch)) {
    return failure(
      invalidValue(value, {
        namespace: Namespace,
        message: 'Invalid OffsetDateTime: missing timezone offset.',
      })
    )
  }

  const offsetResult = TimeZoneOffsets.parseString(offsetMatch[0])
  if (!offsetResult.isSuccess) {
    return offsetResult
  }

  return success(new OffsetDateTime(instantResult.value, offsetResult.value))
}

export const fromString = (value: string): OffsetDateTime => {
  return unpackResult(parseString(value))
}

export const Schema = structuredTransform(Zod.string(), (it: string) => Results.map(parseString(it), (it) => it.toLiteral()))
export const InstanceSchema = structuredTransform(Zod.string(), parseString)

const asInstance = (value: OffsetDateTimeInput): OffsetDateTime => {
  if (value instanceof OffsetDateTime) {
    return value
  }

  return fromString(value)
}

export const addDuration = (element: OffsetDateTimeInput, duration: Duration): OffsetDateTime => {
  const instance = asInstance(element)
  return new OffsetDateTime(Dates.addDuration(instance.instant, duration), instance.offset)
}

export const subtractDuration = (element: OffsetDateTimeInput, duration: Duration): OffsetDateTime => {
  const instance = asInstance(element)
  return new OffsetDateTime(Dates.subtractDuration(instance.instant, duration), instance.offset)
}

export const isBefore = (element: OffsetDateTimeInput, other: OffsetDateTimeInput): boolean => {
  return Dates.isBefore(asInstance(element).instant, asInstance(other).instant)
}

export const isAfter = (element: OffsetDateTimeInput, other: OffsetDateTimeInput): boolean => {
  return Dates.isAfter(asInstance(element).instant, asInstance(other).instant)
}

export const timeUntil = (element: OffsetDateTimeInput, other: OffsetDateTimeInput): Duration => {
  return Dates.timeUntil(asInstance(element).instant, asInstance(other).instant)
}

export const timeBetween = (element: OffsetDateTimeInput, other: OffsetDateTimeInput): Duration => {
  return Dates.timeBetween(asInstance(element).instant, asInstance(other).instant)
}
