import { Clocks, Durations, LocalTimes, TimeZoneIds } from '@bessemer/cornerstone'
import { LocalTime } from '@bessemer/cornerstone/time/local-time'

describe('LocalTimes.now', () => {
  test('should return current local time in UTC', () => {
    const fixedInstant = new Date('2024-07-15T14:30:45.123Z') // 2:30:45.123 PM UTC
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.Utc)

    const result = LocalTimes.now(clock)

    expect(result.hour).toBe(14)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(45)
    expect(result.millisecond).toBe(123)
  })

  test('should return current local time in America/New_York during summer (EDT)', () => {
    const fixedInstant = new Date('2024-07-15T18:30:45.123Z') // 6:30:45.123 PM UTC
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.fromString('America/New_York'))

    const result = LocalTimes.now(clock)

    // EDT is UTC-4, so 18:30 UTC = 14:30 EDT
    expect(result.hour).toBe(14)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(45)
    expect(result.millisecond).toBe(123)
  })

  test('should return current local time in America/New_York during winter (EST)', () => {
    const fixedInstant = new Date('2024-01-15T18:30:45.123Z') // 6:30:45.123 PM UTC
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.fromString('America/New_York'))

    const result = LocalTimes.now(clock)

    // EST is UTC-5, so 18:30 UTC = 13:30 EST
    expect(result.hour).toBe(13)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(45)
    expect(result.millisecond).toBe(123)
  })

  test('should return current local time in Europe/London during summer (BST)', () => {
    const fixedInstant = new Date('2024-07-15T11:30:45.123Z') // 11:30:45.123 AM UTC
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.fromString('Europe/London'))

    const result = LocalTimes.now(clock)

    // BST is UTC+1, so 11:30 UTC = 12:30 BST
    expect(result.hour).toBe(12)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(45)
    expect(result.millisecond).toBe(123)
  })

  test('should return current local time in Europe/London during winter (GMT)', () => {
    const fixedInstant = new Date('2024-01-15T11:30:45.123Z') // 11:30:45.123 AM UTC
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.fromString('Europe/London'))

    const result = LocalTimes.now(clock)

    // GMT is UTC+0, so 11:30 UTC = 11:30 GMT
    expect(result.hour).toBe(11)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(45)
    expect(result.millisecond).toBe(123)
  })

  test('should return current local time in Asia/Tokyo', () => {
    const fixedInstant = new Date('2024-07-15T06:30:45.123Z') // 6:30:45.123 AM UTC
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.fromString('Asia/Tokyo'))

    const result = LocalTimes.now(clock)

    // JST is always UTC+9, so 06:30 UTC = 15:30 JST
    expect(result.hour).toBe(15)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(45)
    expect(result.millisecond).toBe(123)
  })

  test('should handle timezone with half-hour offset (Asia/Kolkata)', () => {
    const fixedInstant = new Date('2024-07-15T06:00:00.500Z') // 6:00:00.500 AM UTC
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.fromString('Asia/Kolkata'))

    const result = LocalTimes.now(clock)

    // IST is UTC+5:30, so 06:00 UTC = 11:30 IST
    expect(result.hour).toBe(11)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(0)
    expect(result.millisecond).toBe(500)
  })

  test('should handle day wrap-around for positive timezone offset', () => {
    const fixedInstant = new Date('2024-07-15T21:30:45.123Z') // 9:30:45.123 PM UTC
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.fromString('Asia/Tokyo'))

    const result = LocalTimes.now(clock)

    // JST is UTC+9, so 21:30 UTC = 06:30 JST (next day)
    expect(result.hour).toBe(6)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(45)
    expect(result.millisecond).toBe(123)
  })

  test('should handle day wrap-around for negative timezone offset', () => {
    const fixedInstant = new Date('2024-07-15T02:30:45.123Z') // 2:30:45.123 AM UTC
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.fromString('America/Los_Angeles'))

    const result = LocalTimes.now(clock)

    // PDT is UTC-7, so 02:30 UTC = 19:30 PDT (previous day)
    expect(result.hour).toBe(19)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(45)
    expect(result.millisecond).toBe(123)
  })

  test('should handle extreme positive offset timezone (Pacific/Kiritimati)', () => {
    const fixedInstant = new Date('2024-07-15T12:00:00.000Z') // 12:00:00.000 PM UTC
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.fromString('Pacific/Kiritimati'))

    const result = LocalTimes.now(clock)

    // UTC+14, so 12:00 UTC = 02:00 next day
    expect(result.hour).toBe(2)
    expect(result.minute).toBe(0)
    expect(result.second).toBe(0)
    expect(result.millisecond).toBe(0)
  })

  test('should handle extreme negative offset timezone (Pacific/Marquesas)', () => {
    const fixedInstant = new Date('2024-07-15T12:00:00.000Z') // 12:00:00.000 PM UTC
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.fromString('Pacific/Marquesas'))

    const result = LocalTimes.now(clock)

    // UTC-9:30, so 12:00 UTC = 02:30 same day
    expect(result.hour).toBe(2)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(0)
    expect(result.millisecond).toBe(0)
  })

  test('should use default system clock when no clock provided', () => {
    const result = LocalTimes.now()

    // Just verify it returns a valid LocalTimeInstance
    expect(result).toBeInstanceOf(LocalTime)
    expect(result.hour).toBeGreaterThanOrEqual(0)
    expect(result.hour).toBeLessThanOrEqual(23)
    expect(result.minute).toBeGreaterThanOrEqual(0)
    expect(result.minute).toBeLessThanOrEqual(59)
    expect(result.second).toBeGreaterThanOrEqual(0)
    expect(result.second).toBeLessThanOrEqual(59)
    expect(result.millisecond).toBeGreaterThanOrEqual(0)
    expect(result.millisecond).toBeLessThanOrEqual(999)
  })

  test('should handle DST transition correctly - spring forward', () => {
    // Spring forward in US: March 10, 2024, 2:00 AM -> 3:00 AM
    const beforeTransition = new Date('2024-03-10T06:30:00.000Z') // 1:30 AM EST
    const afterTransition = new Date('2024-03-10T07:30:00.000Z') // 3:30 AM EDT (2:30 doesn't exist)

    const clockBefore = Clocks.fixed(beforeTransition, TimeZoneIds.fromString('America/New_York'))
    const clockAfter = Clocks.fixed(afterTransition, TimeZoneIds.fromString('America/New_York'))

    const resultBefore = LocalTimes.now(clockBefore)
    const resultAfter = LocalTimes.now(clockAfter)

    expect(resultBefore.hour).toBe(1) // EST
    expect(resultBefore.minute).toBe(30)

    expect(resultAfter.hour).toBe(3) // EDT
    expect(resultAfter.minute).toBe(30)
  })

  test('should handle DST transition correctly - fall back', () => {
    // Fall back in US: November 3, 2024, 2:00 AM -> 1:00 AM
    const beforeTransition = new Date('2024-11-03T05:30:00.000Z') // 1:30 AM EDT
    const afterTransition = new Date('2024-11-03T06:30:00.000Z') // 1:30 AM EST (second occurrence)

    const clockBefore = Clocks.fixed(beforeTransition, TimeZoneIds.fromString('America/New_York'))
    const clockAfter = Clocks.fixed(afterTransition, TimeZoneIds.fromString('America/New_York'))

    const resultBefore = LocalTimes.now(clockBefore)
    const resultAfter = LocalTimes.now(clockAfter)

    expect(resultBefore.hour).toBe(1) // EDT
    expect(resultBefore.minute).toBe(30)

    expect(resultAfter.hour).toBe(1) // EST
    expect(resultAfter.minute).toBe(30)
  })

  test('should preserve millisecond precision', () => {
    const fixedInstant = new Date('2024-07-15T14:30:45.999Z')
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.Utc)

    const result = LocalTimes.now(clock)

    expect(result.millisecond).toBe(999)
  })

  test('should handle midnight correctly', () => {
    const fixedInstant = new Date('2024-07-15T00:00:00.000Z') // UTC midnight
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.Utc)

    const result = LocalTimes.now(clock)

    expect(result.hour).toBe(0)
    expect(result.minute).toBe(0)
    expect(result.second).toBe(0)
    expect(result.millisecond).toBe(0)
  })

  test('should handle near-midnight with timezone offset', () => {
    const fixedInstant = new Date('2024-07-15T23:30:00.000Z') // 11:30 PM UTC
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.fromString('Asia/Tokyo'))

    const result = LocalTimes.now(clock)

    // UTC+9, so 23:30 UTC = 08:30 JST (next day)
    expect(result.hour).toBe(8)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(0)
    expect(result.millisecond).toBe(0)
  })
})

describe('LocalTimes.fromDuration', () => {
  test('should create LocalTime from zero duration', () => {
    const result = LocalTimes.fromDuration(Durations.Zero)

    expect(result.hour).toBe(0)
    expect(result.minute).toBe(0)
    expect(result.second).toBe(0)
    expect(result.millisecond).toBe(0)
  })

  test('should create LocalTime from hour-only durations', () => {
    const result1 = LocalTimes.fromDuration(Durations.fromHours(1))
    expect(result1.hour).toBe(1)
    expect(result1.minute).toBe(0)
    expect(result1.second).toBe(0)
    expect(result1.millisecond).toBe(0)

    const result5 = LocalTimes.fromDuration(Durations.fromHours(5))
    expect(result5.hour).toBe(5)
    expect(result5.minute).toBe(0)
    expect(result5.second).toBe(0)
    expect(result5.millisecond).toBe(0)

    const result23 = LocalTimes.fromDuration(Durations.fromHours(23))
    expect(result23.hour).toBe(23)
    expect(result23.minute).toBe(0)
    expect(result23.second).toBe(0)
    expect(result23.millisecond).toBe(0)
  })

  test('should create LocalTime from minute-only durations', () => {
    const result15 = LocalTimes.fromDuration(Durations.fromMinutes(15))
    expect(result15.hour).toBe(0)
    expect(result15.minute).toBe(15)
    expect(result15.second).toBe(0)
    expect(result15.millisecond).toBe(0)

    const result45 = LocalTimes.fromDuration(Durations.fromMinutes(45))
    expect(result45.hour).toBe(0)
    expect(result45.minute).toBe(45)
    expect(result45.second).toBe(0)
    expect(result45.millisecond).toBe(0)
  })

  test('should create LocalTime from second-only durations', () => {
    const result30 = LocalTimes.fromDuration(Durations.fromSeconds(30))
    expect(result30.hour).toBe(0)
    expect(result30.minute).toBe(0)
    expect(result30.second).toBe(30)
    expect(result30.millisecond).toBe(0)

    const result59 = LocalTimes.fromDuration(Durations.fromSeconds(59))
    expect(result59.hour).toBe(0)
    expect(result59.minute).toBe(0)
    expect(result59.second).toBe(59)
    expect(result59.millisecond).toBe(0)
  })

  test('should create LocalTime from millisecond-only durations', () => {
    const result500 = LocalTimes.fromDuration(Durations.fromMilliseconds(500))
    expect(result500.hour).toBe(0)
    expect(result500.minute).toBe(0)
    expect(result500.second).toBe(0)
    expect(result500.millisecond).toBe(500)

    const result999 = LocalTimes.fromDuration(Durations.fromMilliseconds(999))
    expect(result999.hour).toBe(0)
    expect(result999.minute).toBe(0)
    expect(result999.second).toBe(0)
    expect(result999.millisecond).toBe(999)
  })

  test('should create LocalTime from combined durations', () => {
    const duration = Durations.sum(Durations.fromHours(14), Durations.fromMinutes(30), Durations.fromSeconds(45), Durations.fromMilliseconds(123))

    const result = LocalTimes.fromDuration(duration)

    expect(result.hour).toBe(14)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(45)
    expect(result.millisecond).toBe(123)
  })

  test('should handle wrapping around 24-hour boundary with positive overflow', () => {
    // 25 hours should wrap to 1 hour
    const result25h = LocalTimes.fromDuration(Durations.fromHours(25))
    expect(result25h.hour).toBe(1)
    expect(result25h.minute).toBe(0)
    expect(result25h.second).toBe(0)
    expect(result25h.millisecond).toBe(0)

    // 48 hours should wrap to 0 hours
    const result48h = LocalTimes.fromDuration(Durations.fromHours(48))
    expect(result48h.hour).toBe(0)
    expect(result48h.minute).toBe(0)
    expect(result48h.second).toBe(0)
    expect(result48h.millisecond).toBe(0)

    // 26.5 hours should wrap to 2:30
    const result26h30m = LocalTimes.fromDuration(Durations.fromHours(26.5))
    expect(result26h30m.hour).toBe(2)
    expect(result26h30m.minute).toBe(30)
    expect(result26h30m.second).toBe(0)
    expect(result26h30m.millisecond).toBe(0)
  })

  test('should handle wrapping around 24-hour boundary with negative durations', () => {
    // -1 hour should wrap to 23:00
    const resultNeg1h = LocalTimes.fromDuration(Durations.fromHours(-1))
    expect(resultNeg1h.hour).toBe(23)
    expect(resultNeg1h.minute).toBe(0)
    expect(resultNeg1h.second).toBe(0)
    expect(resultNeg1h.millisecond).toBe(0)

    // -1.5 hours should wrap to 22:30
    const resultNeg1h30m = LocalTimes.fromDuration(Durations.fromHours(-1.5))
    expect(resultNeg1h30m.hour).toBe(22)
    expect(resultNeg1h30m.minute).toBe(30)
    expect(resultNeg1h30m.second).toBe(0)
    expect(resultNeg1h30m.millisecond).toBe(0)

    // -25 hours should wrap to 23:00
    const resultNeg25h = LocalTimes.fromDuration(Durations.fromHours(-25))
    expect(resultNeg25h.hour).toBe(23)
    expect(resultNeg25h.minute).toBe(0)
    expect(resultNeg25h.second).toBe(0)
    expect(resultNeg25h.millisecond).toBe(0)
  })

  test('should handle complex negative durations with mixed components', () => {
    const negativeDuration = Durations.sum(
      Durations.fromHours(-2),
      Durations.fromMinutes(-15),
      Durations.fromSeconds(-30),
      Durations.fromMilliseconds(-500)
    )

    const result = LocalTimes.fromDuration(negativeDuration)

    // -2:15:30.500 should wrap to 21:44:29.500
    expect(result.hour).toBe(21)
    expect(result.minute).toBe(44)
    expect(result.second).toBe(29)
    expect(result.millisecond).toBe(500)
  })

  test('should handle exactly one day duration', () => {
    const result = LocalTimes.fromDuration(Durations.OneDay)

    expect(result.hour).toBe(0)
    expect(result.minute).toBe(0)
    expect(result.second).toBe(0)
    expect(result.millisecond).toBe(0)
  })

  test('should handle multiple days with remainder', () => {
    const duration = Durations.sum(Durations.fromDays(3), Durations.fromHours(5), Durations.fromMinutes(30))

    const result = LocalTimes.fromDuration(duration)

    // 3 days + 5:30 should wrap to 5:30
    expect(result.hour).toBe(5)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(0)
    expect(result.millisecond).toBe(0)
  })

  test('should handle edge case near midnight', () => {
    const almostMidnight = Durations.sum(
      Durations.fromHours(23),
      Durations.fromMinutes(59),
      Durations.fromSeconds(59),
      Durations.fromMilliseconds(999)
    )

    const result = LocalTimes.fromDuration(almostMidnight)

    expect(result.hour).toBe(23)
    expect(result.minute).toBe(59)
    expect(result.second).toBe(59)
    expect(result.millisecond).toBe(999)
  })

  test('should handle very large positive durations', () => {
    const largeDuration = Durations.fromDays(365.25) // ~1 year

    const result = LocalTimes.fromDuration(largeDuration)

    // Should wrap to 6:00 (0.25 days = 6 hours)
    expect(result.hour).toBe(6)
    expect(result.minute).toBe(0)
    expect(result.second).toBe(0)
    expect(result.millisecond).toBe(0)
  })

  test('should handle very large negative durations', () => {
    const largeDuration = Durations.fromDays(-365.75) // ~-1 year and 18 hours

    const result = LocalTimes.fromDuration(largeDuration)

    // -0.75 days = -18 hours, which wraps to 6:00 (24 - 18)
    expect(result.hour).toBe(6)
    expect(result.minute).toBe(0)
    expect(result.second).toBe(0)
    expect(result.millisecond).toBe(0)
  })

  test('should handle fractional milliseconds by truncating', () => {
    // JavaScript floating point arithmetic might produce fractional milliseconds
    const fractionalDuration = Durations.fromMilliseconds(1000.7)

    const result = LocalTimes.fromDuration(fractionalDuration)

    expect(result.hour).toBe(0)
    expect(result.minute).toBe(0)
    expect(result.second).toBe(1)
    expect(result.millisecond).toBe(0) // 0.7 ms should be truncated
  })

  test('should maintain precision with small durations', () => {
    const smallDuration = Durations.fromMilliseconds(1)

    const result = LocalTimes.fromDuration(smallDuration)

    expect(result.hour).toBe(0)
    expect(result.minute).toBe(0)
    expect(result.second).toBe(0)
    expect(result.millisecond).toBe(1)
  })

  test('should handle duration components that exceed normal bounds', () => {
    // Test minutes > 60, seconds > 60, etc.
    const duration = Durations.sum(
      Durations.fromMinutes(90), // 1 hour 30 minutes
      Durations.fromSeconds(120), // 2 minutes
      Durations.fromMilliseconds(2500) // 2.5 seconds
    )

    const result = LocalTimes.fromDuration(duration)

    // 90 min + 120 sec + 2500 ms = 1:30:00 + 0:02:00 + 0:00:02.500 = 1:32:02.500
    expect(result.hour).toBe(1)
    expect(result.minute).toBe(32)
    expect(result.second).toBe(2)
    expect(result.millisecond).toBe(500)
  })

  test('should consistently handle the same duration multiple times', () => {
    const duration = Durations.sum(Durations.fromHours(10), Durations.fromMinutes(30), Durations.fromSeconds(45))

    const result1 = LocalTimes.fromDuration(duration)
    const result2 = LocalTimes.fromDuration(duration)

    expect(result1.hour).toBe(result2.hour)
    expect(result1.minute).toBe(result2.minute)
    expect(result1.second).toBe(result2.second)
    expect(result1.millisecond).toBe(result2.millisecond)

    expect(result1.hour).toBe(10)
    expect(result1.minute).toBe(30)
    expect(result1.second).toBe(45)
    expect(result1.millisecond).toBe(0)
  })
})

describe('LocalTimes.fromString', () => {
  test('should create LocalTime from valid time strings with hours and minutes', () => {
    const result = LocalTimes.fromString('14:30')

    expect(result.hour).toBe(14)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(0)
    expect(result.millisecond).toBe(0)
  })

  test('should create LocalTime from valid time strings with hours, minutes, and seconds', () => {
    const result = LocalTimes.fromString('09:15:45')

    expect(result.hour).toBe(9)
    expect(result.minute).toBe(15)
    expect(result.second).toBe(45)
    expect(result.millisecond).toBe(0)
  })

  test('should create LocalTime from valid time strings with milliseconds', () => {
    const result = LocalTimes.fromString('23:59:59.999')

    expect(result.hour).toBe(23)
    expect(result.minute).toBe(59)
    expect(result.second).toBe(59)
    expect(result.millisecond).toBe(999)
  })

  test('should handle single-digit hours', () => {
    const result = LocalTimes.fromString('5:30')

    expect(result.hour).toBe(5)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(0)
    expect(result.millisecond).toBe(0)
  })

  test('should handle midnight', () => {
    const result = LocalTimes.fromString('0:00')

    expect(result.hour).toBe(0)
    expect(result.minute).toBe(0)
    expect(result.second).toBe(0)
    expect(result.millisecond).toBe(0)
  })

  test('should handle end of day', () => {
    const result = LocalTimes.fromString('23:59:59.999')

    expect(result.hour).toBe(23)
    expect(result.minute).toBe(59)
    expect(result.second).toBe(59)
    expect(result.millisecond).toBe(999)
  })

  test('should handle milliseconds with 1 digit by padding', () => {
    const result = LocalTimes.fromString('12:30:45.5')

    expect(result.hour).toBe(12)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(45)
    expect(result.millisecond).toBe(500)
  })

  test('should handle milliseconds with 2 digits by padding', () => {
    const result = LocalTimes.fromString('12:30:45.75')

    expect(result.hour).toBe(12)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(45)
    expect(result.millisecond).toBe(750)
  })

  test('should handle zero seconds and milliseconds', () => {
    const result = LocalTimes.fromString('10:20:00.000')

    expect(result.hour).toBe(10)
    expect(result.minute).toBe(20)
    expect(result.second).toBe(0)
    expect(result.millisecond).toBe(0)
  })

  test('should handle edge case with maximum valid values', () => {
    const result = LocalTimes.fromString('23:59:59.999')

    expect(result.hour).toBe(23)
    expect(result.minute).toBe(59)
    expect(result.second).toBe(59)
    expect(result.millisecond).toBe(999)
  })

  test('should handle edge case with minimum valid values', () => {
    const result = LocalTimes.fromString('0:00:00.000')

    expect(result.hour).toBe(0)
    expect(result.minute).toBe(0)
    expect(result.second).toBe(0)
    expect(result.millisecond).toBe(0)
  })

  test('should handle noon correctly', () => {
    const result = LocalTimes.fromString('12:00')

    expect(result.hour).toBe(12)
    expect(result.minute).toBe(0)
    expect(result.second).toBe(0)
    expect(result.millisecond).toBe(0)
  })

  test('should handle various valid time combinations', () => {
    const testCases = [
      { input: '1:23', expected: { hour: 1, minute: 23, second: 0, millisecond: 0 } },
      { input: '10:45:30', expected: { hour: 10, minute: 45, second: 30, millisecond: 0 } },
      { input: '0:00:01.001', expected: { hour: 0, minute: 0, second: 1, millisecond: 1 } },
      { input: '23:00:00.100', expected: { hour: 23, minute: 0, second: 0, millisecond: 100 } },
    ]

    testCases.forEach(({ input, expected }) => {
      const result = LocalTimes.fromString(input)

      expect(result.hour).toBe(expected.hour)
      expect(result.minute).toBe(expected.minute)
      expect(result.second).toBe(expected.second)
      expect(result.millisecond).toBe(expected.millisecond)
    })
  })

  test('should throw error for invalid time formats', () => {
    expect(() => LocalTimes.fromString('12:30:45.12345')).toThrow()
    expect(() => LocalTimes.fromString('14')).toThrow()
    expect(() => LocalTimes.fromString('14:3a')).toThrow()
    expect(() => LocalTimes.fromString('14-30')).toThrow()
    expect(() => LocalTimes.fromString('24:00')).toThrow()
    expect(() => LocalTimes.fromString('-1:00')).toThrow()
    expect(() => LocalTimes.fromString('12:60')).toThrow()
    expect(() => LocalTimes.fromString('12:-5')).toThrow()
    expect(() => LocalTimes.fromString('12:30:60')).toThrow()
    expect(() => LocalTimes.fromString('12:30:-1')).toThrow()
    expect(() => LocalTimes.fromString('')).toThrow()
    expect(() => LocalTimes.fromString('12:30:45.')).toThrow()
    expect(() => LocalTimes.fromString('12:5')).toThrow()
    expect(() => LocalTimes.fromString('12:30:5')).toThrow()
    expect(() => LocalTimes.fromString('   ')).toThrow()
    expect(() => LocalTimes.fromString('12:30:45abc')).toThrow()
    expect(() => LocalTimes.fromString(' 12:30:45 ')).toThrow()
    expect(() => LocalTimes.fromString('12::30')).toThrow()
    expect(() => LocalTimes.fromString('12:30:45.1.2')).toThrow()
  })
})

describe('LocalTimes.addDuration', () => {
  test('should add duration correctly', () => {
    const baseTime = LocalTimes.fromProps({ hour: 10, minute: 30, second: 45, millisecond: 500 })
    const oneHour = Durations.fromHours(1)

    const result = LocalTimes.addDuration(baseTime, oneHour)

    expect(result.hour).toBe(11)
    expect(result.minute).toBe(30)
    expect(result.second).toBe(45)
    expect(result.millisecond).toBe(500)
  })

  test('should wrap around midnight', () => {
    const lateTime = LocalTimes.fromProps({ hour: 23, minute: 30, second: 0, millisecond: 0 })
    const oneHour = Durations.fromHours(1)

    const result = LocalTimes.addDuration(lateTime, oneHour)

    expect(result.hour).toBe(0)
    expect(result.minute).toBe(30)
  })
})

describe('LocalTimes.subtractDuration', () => {
  test('should subtract duration correctly', () => {
    const baseTime = LocalTimes.fromProps({ hour: 10, minute: 30, second: 45, millisecond: 500 })
    const thirtyMinutes = Durations.fromMinutes(30)

    const result = LocalTimes.subtractDuration(baseTime, thirtyMinutes)

    expect(result.hour).toBe(10)
    expect(result.minute).toBe(0)
    expect(result.second).toBe(45)
    expect(result.millisecond).toBe(500)
  })

  test('should wrap before midnight', () => {
    const earlyTime = LocalTimes.fromProps({ hour: 0, minute: 30, second: 0, millisecond: 0 })
    const oneHour = Durations.fromHours(1)

    const result = LocalTimes.subtractDuration(earlyTime, oneHour)

    expect(result.hour).toBe(23)
    expect(result.minute).toBe(30)
  })
})

describe('LocalTimes.timeBetween', () => {
  test('should calculate positive duration', () => {
    const baseTime = LocalTimes.fromProps({ hour: 10, minute: 30, second: 45, millisecond: 500 })
    const later = LocalTimes.fromProps({ hour: 11, minute: 30, second: 45, millisecond: 500 })

    const result = LocalTimes.timeBetween(baseTime, later)

    expect(result).toBe(Durations.fromHours(1))
  })

  test('should calculate negative duration', () => {
    const baseTime = LocalTimes.fromProps({ hour: 10, minute: 30, second: 45, millisecond: 500 })
    const earlier = LocalTimes.fromProps({ hour: 9, minute: 30, second: 45, millisecond: 500 })

    const result = LocalTimes.timeBetween(baseTime, earlier)

    expect(result).toBe(-Durations.fromHours(1))
  })
})

describe('LocalTimes.isBefore', () => {
  test('should return true for later time', () => {
    const baseTime = LocalTimes.fromProps({ hour: 10, minute: 30, second: 45, millisecond: 500 })
    const later = LocalTimes.fromProps({ hour: 11, minute: 0, second: 0, millisecond: 0 })

    expect(LocalTimes.isBefore(baseTime, later)).toBe(true)
  })

  test('should return false for earlier time', () => {
    const baseTime = LocalTimes.fromProps({ hour: 10, minute: 30, second: 45, millisecond: 500 })
    const earlier = LocalTimes.fromProps({ hour: 9, minute: 0, second: 0, millisecond: 0 })

    expect(LocalTimes.isBefore(baseTime, earlier)).toBe(false)
  })

  test('should return false for same time', () => {
    const baseTime = LocalTimes.fromProps({ hour: 10, minute: 30, second: 45, millisecond: 500 })
    const same = LocalTimes.fromProps({ hour: 10, minute: 30, second: 45, millisecond: 500 })

    expect(LocalTimes.isBefore(baseTime, same)).toBe(false)
  })
})

describe('LocalTimes.isAfter', () => {
  test('should return true for earlier time', () => {
    const baseTime = LocalTimes.fromProps({ hour: 10, minute: 30, second: 45, millisecond: 500 })
    const earlier = LocalTimes.fromProps({ hour: 9, minute: 0, second: 0, millisecond: 0 })

    expect(LocalTimes.isAfter(baseTime, earlier)).toBe(true)
  })

  test('should return false for later time', () => {
    const baseTime = LocalTimes.fromProps({ hour: 10, minute: 30, second: 45, millisecond: 500 })
    const later = LocalTimes.fromProps({ hour: 11, minute: 0, second: 0, millisecond: 0 })

    expect(LocalTimes.isAfter(baseTime, later)).toBe(false)
  })

  test('should return false for same time', () => {
    const baseTime = LocalTimes.fromProps({ hour: 10, minute: 30, second: 45, millisecond: 500 })
    const same = LocalTimes.fromProps({ hour: 10, minute: 30, second: 45, millisecond: 500 })

    expect(LocalTimes.isAfter(baseTime, same)).toBe(false)
  })
})

describe('LocalTimes.timeUntil', () => {
  test('should calculate duration until later time same day', () => {
    const baseTime = LocalTimes.fromProps({ hour: 10, minute: 30, second: 45, millisecond: 500 })
    const later = LocalTimes.fromProps({ hour: 12, minute: 30, second: 45, millisecond: 500 })

    const result = LocalTimes.timeUntil(baseTime, later)

    expect(result).toBe(Durations.fromHours(2))
  })

  test('should calculate duration until earlier time next day', () => {
    const baseTime = LocalTimes.fromProps({ hour: 10, minute: 30, second: 45, millisecond: 500 })
    const earlier = LocalTimes.fromProps({ hour: 8, minute: 30, second: 45, millisecond: 500 })

    const result = LocalTimes.timeUntil(baseTime, earlier)

    expect(result).toBe(Durations.fromHours(22))
  })

  test('should return zero for same time', () => {
    const baseTime = LocalTimes.fromProps({ hour: 10, minute: 30, second: 45, millisecond: 500 })
    const same = LocalTimes.fromProps({ hour: 10, minute: 30, second: 45, millisecond: 500 })

    const result = LocalTimes.timeUntil(baseTime, same)

    expect(result).toBe(Durations.Zero)
  })
})

describe('LocalTime.toLiteral', () => {
  test('should format basic time correctly', () => {
    const time = LocalTimes.fromProps({ hour: 14, minute: 30, second: 0, millisecond: 0 })
    expect(time.toLiteral()).toBe('14:30')
  })

  test('should format time with seconds', () => {
    const time = LocalTimes.fromProps({ hour: 9, minute: 15, second: 45, millisecond: 0 })
    expect(time.toLiteral()).toBe('09:15:45')
  })

  test('should format time with milliseconds', () => {
    const time = LocalTimes.fromProps({ hour: 23, minute: 59, second: 59, millisecond: 999 })
    expect(time.toLiteral()).toBe('23:59:59.999')
  })

  test('should format time with only milliseconds, no seconds', () => {
    const time = LocalTimes.fromProps({ hour: 12, minute: 0, second: 0, millisecond: 500 })
    expect(time.toLiteral()).toBe('12:00.500')
  })

  test('should pad single-digit hours and minutes with zeros', () => {
    const time = LocalTimes.fromProps({ hour: 5, minute: 7, second: 0, millisecond: 0 })
    expect(time.toLiteral()).toBe('05:07')
  })

  test('should pad single-digit seconds with zeros', () => {
    const time = LocalTimes.fromProps({ hour: 10, minute: 30, second: 5, millisecond: 0 })
    expect(time.toLiteral()).toBe('10:30:05')
  })

  test('should pad milliseconds correctly', () => {
    const time1 = LocalTimes.fromProps({ hour: 8, minute: 30, second: 15, millisecond: 5 })
    expect(time1.toLiteral()).toBe('08:30:15.005')

    const time2 = LocalTimes.fromProps({ hour: 8, minute: 30, second: 15, millisecond: 50 })
    expect(time2.toLiteral()).toBe('08:30:15.050')
  })

  test('should format midnight correctly', () => {
    const time = LocalTimes.fromProps({ hour: 0, minute: 0, second: 0, millisecond: 0 })
    expect(time.toLiteral()).toBe('00:00')
  })

  test('should format end of day correctly', () => {
    const time = LocalTimes.fromProps({ hour: 23, minute: 59, second: 59, millisecond: 0 })
    expect(time.toLiteral()).toBe('23:59:59')
  })
})
