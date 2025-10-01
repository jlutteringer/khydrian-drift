import { TimeZoneId, Utc } from '@bessemer/cornerstone/time/time-zone-id'
import { Duration } from '@bessemer/cornerstone/time/duration'
import { addDuration } from '@bessemer/cornerstone/time/date'

export interface Clock {
  readonly zone: TimeZoneId

  withZone: (zone: TimeZoneId) => Clock

  instant: () => Date
}

class SystemClock implements Clock {
  constructor(readonly zone: TimeZoneId) {}

  instant(): Date {
    return new Date()
  }

  withZone(zone: TimeZoneId): Clock {
    if (zone === this.zone) {
      return this
    }

    return new SystemClock(zone)
  }
}

class FixedClock implements Clock {
  constructor(private fixedInstant: Date, readonly zone: TimeZoneId) {}

  instant(): Date {
    return this.fixedInstant
  }

  withZone(zone: TimeZoneId): Clock {
    if (zone === this.zone) {
      return this
    }

    return new FixedClock(this.fixedInstant, zone)
  }
}

class OffsetClock implements Clock {
  readonly zone: TimeZoneId

  constructor(private clock: Clock, private offset: Duration) {
    this.zone = this.clock.zone
  }

  instant(): Date {
    return addDuration(this.clock.instant(), this.offset)
  }

  withZone(zone: TimeZoneId): Clock {
    if (zone === this.clock.zone) {
      return this
    }

    return new OffsetClock(this.clock.withZone(zone), this.offset)
  }
}

export const SystemUtc = new SystemClock(Utc)
export const Default = SystemUtc

export const system = (zone: TimeZoneId = Utc): Clock => {
  if (zone == Utc) {
    return SystemUtc
  }

  return new SystemClock(zone)
}

export const fixed = (fixedInstant: Date, zone: TimeZoneId = Utc): Clock => {
  return new FixedClock(fixedInstant, zone)
}

export const offset = (clock: Clock, offset: Duration): Clock => {
  if (offset === 0) {
    return clock
  }

  return new OffsetClock(clock, offset)
}
