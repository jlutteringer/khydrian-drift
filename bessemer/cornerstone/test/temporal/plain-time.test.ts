import { Clocks, Durations, Locales, PlainTimes, TimeZoneIds } from '@bessemer/cornerstone'
import { Temporal } from '@js-temporal/polyfill'
import { PlainTimeLiteral } from '@bessemer/cornerstone/temporal/plain-time'

describe('PlainTimes.now', () => {
  test('should return current plain time in UTC', () => {
    const fixedInstant = Temporal.Instant.from('2024-07-15T14:30:45.123Z')
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.Utc)

    const result = PlainTimes.now(TimeZoneIds.Utc, clock)

    expect(result.hour).toBe(14)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(45)
    expect(result.millisecond).toBe(123)
  })

  test('should return current plain time in America/New_York during summer (EDT)', () => {
    const fixedInstant = Temporal.Instant.from('2024-07-15T18:30:45.123Z')
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.fromString('America/New_York'))

    const result = PlainTimes.now(TimeZoneIds.fromString('America/New_York'), clock)

    // EDT is UTC-4, so 18:30 UTC = 14:30 EDT
    expect(result.hour).toBe(14)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(45)
    expect(result.millisecond).toBe(123)
  })

  test('should return current plain time in America/New_York during winter (EST)', () => {
    const fixedInstant = Temporal.Instant.from('2024-01-15T18:30:45.123Z')
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.fromString('America/New_York'))

    const result = PlainTimes.now(TimeZoneIds.fromString('America/New_York'), clock)

    // EST is UTC-5, so 18:30 UTC = 13:30 EST
    expect(result.hour).toBe(13)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(45)
    expect(result.millisecond).toBe(123)
  })

  test('should return current plain time in Europe/London during summer (BST)', () => {
    const fixedInstant = Temporal.Instant.from('2024-07-15T11:30:45.123Z')
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.fromString('Europe/London'))

    const result = PlainTimes.now(TimeZoneIds.fromString('Europe/London'), clock)

    // BST is UTC+1, so 11:30 UTC = 12:30 BST
    expect(result.hour).toBe(12)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(45)
    expect(result.millisecond).toBe(123)
  })

  test('should return current plain time in Europe/London during winter (GMT)', () => {
    const fixedInstant = Temporal.Instant.from('2024-01-15T11:30:45.123Z')
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.fromString('Europe/London'))

    const result = PlainTimes.now(TimeZoneIds.fromString('Europe/London'), clock)

    // GMT is UTC+0, so 11:30 UTC = 11:30 GMT
    expect(result.hour).toBe(11)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(45)
    expect(result.millisecond).toBe(123)
  })

  test('should return current plain time in Asia/Tokyo', () => {
    const fixedInstant = Temporal.Instant.from('2024-07-15T06:30:45.123Z')
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.fromString('Asia/Tokyo'))

    const result = PlainTimes.now(TimeZoneIds.fromString('Asia/Tokyo'), clock)

    // JST is always UTC+9, so 06:30 UTC = 15:30 JST
    expect(result.hour).toBe(15)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(45)
    expect(result.millisecond).toBe(123)
  })

  test('should handle timezone with half-hour offset (Asia/Kolkata)', () => {
    const fixedInstant = Temporal.Instant.from('2024-07-15T06:00:00.500Z')
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.fromString('Asia/Kolkata'))

    const result = PlainTimes.now(TimeZoneIds.fromString('Asia/Kolkata'), clock)

    // IST is UTC+5:30, so 06:00 UTC = 11:30 IST
    expect(result.hour).toBe(11)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(0)
    expect(result.millisecond).toBe(500)
  })

  test('should handle day wrap-around for positive timezone offset', () => {
    const fixedInstant = Temporal.Instant.from('2024-07-15T21:30:45.123Z')
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.fromString('Asia/Tokyo'))

    const result = PlainTimes.now(TimeZoneIds.fromString('Asia/Tokyo'), clock)

    // JST is UTC+9, so 21:30 UTC = 06:30 JST (next day)
    expect(result.hour).toBe(6)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(45)
    expect(result.millisecond).toBe(123)
  })

  test('should handle day wrap-around for negative timezone offset', () => {
    const fixedInstant = Temporal.Instant.from('2024-07-15T02:30:45.123Z')
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.fromString('America/Los_Angeles'))

    const result = PlainTimes.now(TimeZoneIds.fromString('America/Los_Angeles'), clock)

    // PDT is UTC-7, so 02:30 UTC = 19:30 PDT (previous day)
    expect(result.hour).toBe(19)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(45)
    expect(result.millisecond).toBe(123)
  })

  test('should use default system clock when no clock provided', () => {
    const result = PlainTimes.now(TimeZoneIds.Utc)

    expect(result.hour).toBeGreaterThanOrEqual(0)
    expect(result.hour).toBeLessThanOrEqual(23)
    expect(result.minute).toBeGreaterThanOrEqual(0)
    expect(result.minute).toBeLessThanOrEqual(59)
    expect(result.second).toBeGreaterThanOrEqual(0)
    expect(result.second).toBeLessThanOrEqual(59)
    expect(result.millisecond).toBeGreaterThanOrEqual(0)
    expect(result.millisecond).toBeLessThanOrEqual(999)
  })
})

describe('PlainTimes.fromDuration', () => {
  test('should create PlainTime from zero duration', () => {
    const result = PlainTimes.fromDuration(Durations.Zero)

    expect(result.hour).toBe(0)
    expect(result.minute).toBe(0)
    expect(result.second).toBe(0)
    expect(result.millisecond).toBe(0)
  })

  test('should create PlainTime from hour-only durations', () => {
    const result1 = PlainTimes.fromDuration({ hours: 1 })
    expect(result1.hour).toBe(1)
    expect(result1.minute).toBe(0)
    expect(result1.second).toBe(0)
    expect(result1.millisecond).toBe(0)

    const result5 = PlainTimes.fromDuration({ hours: 5 })
    expect(result5.hour).toBe(5)
    expect(result5.minute).toBe(0)
    expect(result5.second).toBe(0)
    expect(result5.millisecond).toBe(0)

    const result23 = PlainTimes.fromDuration({ hours: 23 })
    expect(result23.hour).toBe(23)
    expect(result23.minute).toBe(0)
    expect(result23.second).toBe(0)
    expect(result23.millisecond).toBe(0)
  })

  test('should create PlainTime from minute-only durations', () => {
    const result15 = PlainTimes.fromDuration({ minutes: 15 })
    expect(result15.hour).toBe(0)
    expect(result15.minute).toBe(15)
    expect(result15.second).toBe(0)
    expect(result15.millisecond).toBe(0)

    const result45 = PlainTimes.fromDuration({ minutes: 45 })
    expect(result45.hour).toBe(0)
    expect(result45.minute).toBe(45)
    expect(result45.second).toBe(0)
    expect(result45.millisecond).toBe(0)
  })

  test('should create PlainTime from combined durations', () => {
    const duration = Durations.add({ hours: 14, minutes: 30, seconds: 45, milliseconds: 123 })
    const result = PlainTimes.fromDuration(duration)

    expect(result.hour).toBe(14)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(45)
    expect(result.millisecond).toBe(123)
  })

  test('should handle wrapping around 24-hour boundary with positive overflow', () => {
    // 25 hours should wrap to 1 hour
    const result25h = PlainTimes.fromDuration({ hours: 25 })
    expect(result25h.hour).toBe(1)
    expect(result25h.minute).toBe(0)
    expect(result25h.second).toBe(0)
    expect(result25h.millisecond).toBe(0)

    // 48 hours should wrap to 0 hours
    const result48h = PlainTimes.fromDuration({ hours: 48 })
    expect(result48h.hour).toBe(0)
    expect(result48h.minute).toBe(0)
    expect(result48h.second).toBe(0)
    expect(result48h.millisecond).toBe(0)
  })

  test('should handle wrapping around 24-hour boundary with negative durations', () => {
    // -1 hour should wrap to 23:00
    const resultNeg1h = PlainTimes.fromDuration({ hours: -1 })
    expect(resultNeg1h.hour).toBe(23)
    expect(resultNeg1h.minute).toBe(0)
    expect(resultNeg1h.second).toBe(0)
    expect(resultNeg1h.millisecond).toBe(0)

    // -1.5 hours should wrap to 22:30
    const resultNeg1h30m = PlainTimes.fromDuration({ hours: -1, minutes: -30 })
    expect(resultNeg1h30m.hour).toBe(22)
    expect(resultNeg1h30m.minute).toBe(30)
    expect(resultNeg1h30m.second).toBe(0)
    expect(resultNeg1h30m.millisecond).toBe(0)
  })
})

describe('PlainTimes.parseString', () => {
  test('should parse valid time string with all components', () => {
    const result = PlainTimes.parseString('14:30:45.123')

    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value.hour).toBe(14)
      expect(result.value.minute).toBe(30)
      expect(result.value.second).toBe(45)
      expect(result.value.millisecond).toBe(123)
    }
  })

  test('should parse time string without milliseconds', () => {
    const result = PlainTimes.parseString('14:30:45')

    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value.hour).toBe(14)
      expect(result.value.minute).toBe(30)
      expect(result.value.second).toBe(45)
      expect(result.value.millisecond).toBe(0)
    }
  })

  test('should parse time string without seconds', () => {
    const result = PlainTimes.parseString('14:30')

    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value.hour).toBe(14)
      expect(result.value.minute).toBe(30)
      expect(result.value.second).toBe(0)
      expect(result.value.millisecond).toBe(0)
    }
  })

  test('should parse midnight correctly', () => {
    const result = PlainTimes.parseString('00:00:00')

    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value.hour).toBe(0)
      expect(result.value.minute).toBe(0)
      expect(result.value.second).toBe(0)
      expect(result.value.millisecond).toBe(0)
    }
  })

  test('should parse end of day correctly', () => {
    const result = PlainTimes.parseString('23:59:59.999')

    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value.hour).toBe(23)
      expect(result.value.minute).toBe(59)
      expect(result.value.second).toBe(59)
      expect(result.value.millisecond).toBe(999)
    }
  })

  test('should fail on invalid time format', () => {
    const result = PlainTimes.parseString('invalid-time')

    expect(result.isSuccess).toBe(false)
  })

  test('should fail on invalid hour', () => {
    const result = PlainTimes.parseString('24:00:00')

    expect(result.isSuccess).toBe(false)
  })

  test('should fail on invalid minute', () => {
    const result = PlainTimes.parseString('12:60:00')
    expect(result.isSuccess).toBe(false)
  })

  // FUTURE for some reason this parses successfully and sets the time to 59 seconds... I suspect this is a bug in the polyfill
  // test('should fail on invalid second', () => {
  //   const result = PlainTimes.parseString('12:30:60')
  //   expect(result.isSuccess).toBe(false)
  // })
})

describe('PlainTimes.fromString', () => {
  test('should parse valid time string successfully', () => {
    const result = PlainTimes.fromString('14:30:45.123')

    expect(result).toBeInstanceOf(Temporal.PlainTime)
    expect(result.hour).toBe(14)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(45)
    expect(result.millisecond).toBe(123)
  })

  test('should throw on invalid string', () => {
    expect(() => PlainTimes.fromString('invalid-time')).toThrow()
  })
})

describe('PlainTimes.add', () => {
  test('should add duration correctly', () => {
    const time = PlainTimes.fromString('14:30:45.123')
    const duration = Durations.fromHours(2)

    const result = PlainTimes.add(time, duration)

    expect(result.hour).toBe(16)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(45)
    expect(result.millisecond).toBe(123)
  })

  test('should wrap around 24-hour boundary', () => {
    const time = PlainTimes.fromString('23:30:00')
    const duration = Durations.fromHours(2)

    const result = PlainTimes.add(time, duration)

    expect(result.hour).toBe(1)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(0)
  })

  test('should work with string input', () => {
    const duration = Durations.fromMinutes(15)

    const result = PlainTimes.add('12:00:00' as PlainTimeLiteral, duration)

    expect(result.hour).toBe(12)
    expect(result.minute).toBe(15)
    expect(result.second).toBe(0)
  })

  test('should add complex duration', () => {
    const time = PlainTimes.fromString('10:15:30.500')
    const duration = Durations.add(Durations.fromHours(1), Durations.fromMinutes(20), Durations.fromSeconds(15), Durations.fromMilliseconds(250))

    const result = PlainTimes.add(time, duration)

    expect(result.hour).toBe(11)
    expect(result.minute).toBe(35)
    expect(result.second).toBe(45)
    expect(result.millisecond).toBe(750)
  })
})

describe('PlainTimes.subtract', () => {
  test('should subtract duration correctly', () => {
    const time = PlainTimes.fromString('16:45:30.500')
    const duration = Durations.fromHours(2)

    const result = PlainTimes.subtract(time, duration)

    expect(result.hour).toBe(14)
    expect(result.minute).toBe(45)
    expect(result.second).toBe(30)
    expect(result.millisecond).toBe(500)
  })

  test('should wrap around 24-hour boundary backwards', () => {
    const time = PlainTimes.fromString('01:30:00')
    const duration = Durations.fromHours(3)

    const result = PlainTimes.subtract(time, duration)

    expect(result.hour).toBe(22)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(0)
  })

  test('should subtract milliseconds correctly', () => {
    const time = PlainTimes.fromString('12:30:45.750')
    const duration = Durations.fromMilliseconds(250)

    const result = PlainTimes.subtract(time, duration)

    expect(result.hour).toBe(12)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(45)
    expect(result.millisecond).toBe(500)
  })
})

describe('PlainTimes.isBefore', () => {
  test('should return true for earlier time', () => {
    const earlier = PlainTimes.fromString('10:00:00')
    const later = PlainTimes.fromString('12:00:00')

    expect(PlainTimes.isBefore(earlier, later)).toBe(true)
  })

  test('should return false for later time', () => {
    const earlier = PlainTimes.fromString('10:00:00')
    const later = PlainTimes.fromString('12:00:00')

    expect(PlainTimes.isBefore(later, earlier)).toBe(false)
  })

  test('should return false for same time', () => {
    const time = PlainTimes.fromString('12:30:45')

    expect(PlainTimes.isBefore(time, time)).toBe(false)
  })

  test('should handle cross-day comparison', () => {
    const midnight = PlainTimes.fromString('00:00:00')
    const almostMidnight = PlainTimes.fromString('23:59:59')

    expect(PlainTimes.isBefore(midnight, almostMidnight)).toBe(true)
  })
})

describe('PlainTimes.isAfter', () => {
  test('should return true for later time', () => {
    const earlier = PlainTimes.fromString('10:00:00')
    const later = PlainTimes.fromString('12:00:00')

    expect(PlainTimes.isAfter(later, earlier)).toBe(true)
  })

  test('should return false for earlier time', () => {
    const earlier = PlainTimes.fromString('10:00:00')
    const later = PlainTimes.fromString('12:00:00')

    expect(PlainTimes.isAfter(earlier, later)).toBe(false)
  })

  test('should return false for same time', () => {
    const time = PlainTimes.fromString('12:30:45')

    expect(PlainTimes.isAfter(time, time)).toBe(false)
  })
})

describe('PlainTimes.toLiteral', () => {
  test('should convert PlainTime to literal string with all components', () => {
    const time = PlainTimes.fromString('14:30:45.123')
    const result = PlainTimes.toLiteral(time)
    expect(result).toBe('14:30:45.123')
  })

  test('should convert PlainTime to literal string without milliseconds', () => {
    const time = PlainTimes.fromString('14:30:45')
    const result = PlainTimes.toLiteral(time)
    expect(result).toBe('14:30:45')
  })

  test('should convert PlainTime to literal string without seconds', () => {
    const time = PlainTimes.fromString('14:30')
    const result = PlainTimes.toLiteral(time)
    expect(result).toBe('14:30')
  })

  test('should convert midnight to literal correctly', () => {
    const time = PlainTimes.fromString('00:00:00')
    const result = PlainTimes.toLiteral(time)
    expect(result).toBe('00:00')
  })

  test('should convert end of day to literal correctly', () => {
    const time = PlainTimes.fromString('23:59:59.999')
    const result = PlainTimes.toLiteral(time)
    expect(result).toBe('23:59:59.999')
  })

  test('should maintain proper format for single-digit components', () => {
    const time = PlainTimes.fromString('09:05:03.001')
    const result = PlainTimes.toLiteral(time)
    expect(result).toBe('09:05:03.001')
  })

  test('should handle zero milliseconds correctly', () => {
    const time = PlainTimes.fromString('12:30:45.000')
    const result = PlainTimes.toLiteral(time)
    expect(result).toMatch('12:30:45')
  })
})

describe('PlainTimes.format', () => {
  test('should format time with default options in English locale', () => {
    const time = PlainTimes.from({ hour: 14, minute: 30, second: 45 })
    const result = PlainTimes.format(time, Locales.AmericanEnglish)

    // Should produce something like "2:30:45 PM" for US locale
    expect(result).toContain('2:30')
    expect(result).toContain('PM')
  })

  test('should format time with 24-hour format', () => {
    const time = PlainTimes.from({ hour: 14, minute: 30, second: 0 })
    const result = PlainTimes.format(time, Locales.AmericanEnglish, { hour12: false })

    expect(result).toContain('14:30')
  })

  test('should format time without seconds', () => {
    const time = PlainTimes.from({ hour: 9, minute: 15, second: 30 })
    const result = PlainTimes.format(time, Locales.AmericanEnglish, {
      hour: '2-digit',
      minute: '2-digit',
      // No second option means seconds won't be shown
    })

    expect(result).toContain('09:15')
    expect(result).not.toContain(':30')
  })

  test('should work with different locales', () => {
    const time = PlainTimes.from({ hour: 14, minute: 30 })

    const usResult = PlainTimes.format(time, Locales.AmericanEnglish, {})
    const deResult = PlainTimes.format(time, Locales.fromString('de-DE'), {})

    // Just verify they're different (locale-specific formatting)
    expect(usResult).not.toBe(deResult)
  })

  test('should work with builder object input', () => {
    const result = PlainTimes.format({ hour: 9, minute: 45 }, Locales.AmericanEnglish, { hour: 'numeric', minute: '2-digit' })
    expect(result).toContain('9:45')
  })
})
