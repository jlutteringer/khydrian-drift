import { TimeZoneId, Utc } from '@bessemer/cornerstone/temporal/time-zone-id'
import { Duration, DurationLike, from as fromDuration, isZero } from '@bessemer/cornerstone/temporal/duration'
import { from as fromInstant, Instant, InstantLike } from '@bessemer/cornerstone/temporal/instant'
import { Temporal } from '@js-temporal/polyfill'

export interface Clock {
  readonly zone: TimeZoneId

  withZone: (zone: TimeZoneId) => Clock

  instant: () => Instant
}

class SystemClock implements Clock {
  constructor(readonly zone: TimeZoneId) {}

  instant(): Instant {
    return Temporal.Now.instant()
  }

  withZone(zone: TimeZoneId): Clock {
    if (zone === this.zone) {
      return this
    }

    return new SystemClock(zone)
  }
}

class FixedClock implements Clock {
  constructor(private fixedInstant: Instant, readonly zone: TimeZoneId) {}

  instant(): Instant {
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

  instant(): Instant {
    return this.clock.instant().add(this.offset)
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

export const fixed = (fixedInstant: InstantLike, zone: TimeZoneId = Utc): Clock => {
  return new FixedClock(fromInstant(fixedInstant), zone)
}

export const offset = (clock: Clock, offset: DurationLike): Clock => {
  if (isZero(offset)) {
    return clock
  }

  return new OffsetClock(clock, fromDuration(offset))
}
