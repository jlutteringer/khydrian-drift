import { Clocks, Durations, OffsetDateTimes, TimeZoneIds, TimeZoneOffsets } from '@bessemer/cornerstone'
import { OffsetDateTime } from '@bessemer/cornerstone/time/offset-date-time'

describe('OffsetDateTimes.now', () => {
  test('should return current offset date-time in UTC', () => {
    const fixedInstant = new Date('2024-07-15T14:30:45.123Z')
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.Utc)

    const result = OffsetDateTimes.now(clock)

    expect(result.instant).toEqual(fixedInstant)
    expect(result.offset).toBe(TimeZoneOffsets.Utc)
  })

  test('should return current offset date-time in America/New_York during summer (EDT)', () => {
    const fixedInstant = new Date('2024-07-15T18:30:45.123Z')
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.fromString('America/New_York'))

    const result = OffsetDateTimes.now(clock)

    expect(result.instant).toEqual(fixedInstant)
    expect(result.offset).toBe(TimeZoneOffsets.fromString('-04:00'))
  })

  test('should return current offset date-time in America/New_York during winter (EST)', () => {
    const fixedInstant = new Date('2024-01-15T18:30:45.123Z')
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.fromString('America/New_York'))

    const result = OffsetDateTimes.now(clock)

    expect(result.instant).toEqual(fixedInstant)
    expect(result.offset).toBe(TimeZoneOffsets.fromString('-05:00'))
  })

  test('should return current offset date-time in Europe/London during summer (BST)', () => {
    const fixedInstant = new Date('2024-07-15T11:30:45.123Z')
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.fromString('Europe/London'))

    const result = OffsetDateTimes.now(clock)

    expect(result.instant).toEqual(fixedInstant)
    expect(result.offset).toBe(TimeZoneOffsets.fromString('+01:00'))
  })

  test('should return current offset date-time in Europe/London during winter (GMT)', () => {
    const fixedInstant = new Date('2024-01-15T11:30:45.123Z')
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.fromString('Europe/London'))

    const result = OffsetDateTimes.now(clock)

    expect(result.instant).toEqual(fixedInstant)
    expect(result.offset).toBe(TimeZoneOffsets.Utc)
  })

  test('should return current offset date-time in Asia/Tokyo', () => {
    const fixedInstant = new Date('2024-07-15T06:30:45.123Z')
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.fromString('Asia/Tokyo'))

    const result = OffsetDateTimes.now(clock)

    expect(result.instant).toEqual(fixedInstant)
    expect(result.offset).toBe(TimeZoneOffsets.fromString('+09:00'))
  })

  test('should handle timezone with half-hour offset (Asia/Kolkata)', () => {
    const fixedInstant = new Date('2024-07-15T06:00:00.500Z')
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.fromString('Asia/Kolkata'))

    const result = OffsetDateTimes.now(clock)

    expect(result.instant).toEqual(fixedInstant)
    expect(result.offset).toBe(TimeZoneOffsets.fromString('+05:30'))
  })

  test('should handle extreme positive offset timezone (Pacific/Kiritimati)', () => {
    const fixedInstant = new Date('2024-07-15T12:00:00.000Z')
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.fromString('Pacific/Kiritimati'))

    const result = OffsetDateTimes.now(clock)

    expect(result.instant).toEqual(fixedInstant)
    expect(result.offset).toBe(TimeZoneOffsets.fromString('+14:00'))
  })

  test('should handle extreme negative offset timezone (Pacific/Marquesas)', () => {
    const fixedInstant = new Date('2024-07-15T12:00:00.000Z')
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.fromString('Pacific/Marquesas'))

    const result = OffsetDateTimes.now(clock)

    expect(result.instant).toEqual(fixedInstant)
    expect(result.offset).toBe(TimeZoneOffsets.fromString('-09:30'))
  })

  test('should use default system clock when no clock provided', () => {
    const result = OffsetDateTimes.now()

    expect(result).toBeInstanceOf(OffsetDateTime)
    expect(result.instant).toBeInstanceOf(Date)
    expect(typeof result.offset).toBe('number')
  })

  test('should handle DST transition correctly - spring forward', () => {
    const beforeTransition = new Date('2024-03-10T06:30:00.000Z')
    const afterTransition = new Date('2024-03-10T07:30:00.000Z')

    const clockBefore = Clocks.fixed(beforeTransition, TimeZoneIds.fromString('America/New_York'))
    const clockAfter = Clocks.fixed(afterTransition, TimeZoneIds.fromString('America/New_York'))

    const resultBefore = OffsetDateTimes.now(clockBefore)
    const resultAfter = OffsetDateTimes.now(clockAfter)

    expect(resultBefore.offset).toBe(TimeZoneOffsets.fromString('-05:00')) // EST
    expect(resultAfter.offset).toBe(TimeZoneOffsets.fromString('-04:00')) // EDT
  })

  test('should handle DST transition correctly - fall back', () => {
    const beforeTransition = new Date('2024-11-03T05:30:00.000Z')
    const afterTransition = new Date('2024-11-03T06:30:00.000Z')

    const clockBefore = Clocks.fixed(beforeTransition, TimeZoneIds.fromString('America/New_York'))
    const clockAfter = Clocks.fixed(afterTransition, TimeZoneIds.fromString('America/New_York'))

    const resultBefore = OffsetDateTimes.now(clockBefore)
    const resultAfter = OffsetDateTimes.now(clockAfter)

    expect(resultBefore.offset).toBe(TimeZoneOffsets.fromString('-04:00')) // EDT
    expect(resultAfter.offset).toBe(TimeZoneOffsets.fromString('-05:00')) // EST
  })
})

describe('OffsetDateTimes.fromInstant', () => {
  test('should create OffsetDateTime from instant and UTC timezone', () => {
    const instant = new Date('2024-07-15T14:30:45.123Z')
    const result = OffsetDateTimes.fromInstant(instant, TimeZoneIds.Utc)

    expect(result.instant).toEqual(instant)
    expect(result.offset).toBe(TimeZoneOffsets.Utc)
  })

  test('should create OffsetDateTime from instant and specific timezone', () => {
    const instant = new Date('2024-07-15T14:30:45.123Z')
    const result = OffsetDateTimes.fromInstant(instant, TimeZoneIds.fromString('America/New_York'))

    expect(result.instant).toEqual(instant)
    expect(result.offset).toBe(TimeZoneOffsets.fromString('-04:00'))
  })

  test('should handle DST transitions properly', () => {
    const winterInstant = new Date('2024-01-15T14:30:45.123Z')
    const summerInstant = new Date('2024-07-15T14:30:45.123Z')

    const winterResult = OffsetDateTimes.fromInstant(winterInstant, TimeZoneIds.fromString('America/New_York'))
    const summerResult = OffsetDateTimes.fromInstant(summerInstant, TimeZoneIds.fromString('America/New_York'))

    expect(winterResult.offset).toBe(TimeZoneOffsets.fromString('-05:00')) // EST
    expect(summerResult.offset).toBe(TimeZoneOffsets.fromString('-04:00')) // EDT
  })
})

describe('OffsetDateTimes.parseString', () => {
  test('should parse valid ISO string with Z offset', () => {
    const result = OffsetDateTimes.parseString('2024-07-15T14:30:45.123Z')

    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value.instant).toEqual(new Date('2024-07-15T14:30:45.123Z'))
      expect(result.value.offset).toBe(TimeZoneOffsets.Utc)
    }
  })

  test('should parse valid ISO string with positive offset', () => {
    const result = OffsetDateTimes.parseString('2024-07-15T14:30:45.123+05:30')

    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value.offset).toBe(TimeZoneOffsets.fromString('+05:30'))
    }
  })

  test('should parse valid ISO string with negative offset', () => {
    const result = OffsetDateTimes.parseString('2024-07-15T14:30:45.123-08:00')

    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value.offset).toBe(TimeZoneOffsets.fromString('-08:00'))
    }
  })

  test('should parse ISO string without milliseconds', () => {
    const result = OffsetDateTimes.parseString('2024-07-15T14:30:45Z')

    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value.instant).toEqual(new Date('2024-07-15T14:30:45.000Z'))
      expect(result.value.offset).toBe(TimeZoneOffsets.Utc)
    }
  })

  test('should fail on invalid date format', () => {
    const result = OffsetDateTimes.parseString('invalid-date')

    expect(result.isSuccess).toBe(false)
  })

  test('should fail on missing timezone offset', () => {
    const result = OffsetDateTimes.parseString('2024-07-15T14:30:45.123')

    expect(result.isSuccess).toBe(false)
  })

  test('should fail on invalid timezone offset', () => {
    const result = OffsetDateTimes.parseString('2024-07-15T14:30:45.123+25:00')

    expect(result.isSuccess).toBe(false)
  })
})

describe('OffsetDateTimes.fromString', () => {
  test('should parse valid ISO string successfully', () => {
    const result = OffsetDateTimes.fromString('2024-07-15T14:30:45.123Z')

    expect(result).toBeInstanceOf(OffsetDateTime)
    expect(result.instant).toEqual(new Date('2024-07-15T14:30:45.123Z'))
    expect(result.offset).toBe(TimeZoneOffsets.Utc)
  })

  test('should throw on invalid string', () => {
    expect(() => OffsetDateTimes.fromString('invalid-date')).toThrow()
  })
})

describe('OffsetDateTimes.toLiteral', () => {
  test('should format UTC time correctly', () => {
    const instant = new Date('2024-01-15T14:30:45.000Z')
    const offset = TimeZoneOffsets.Utc
    const dateTime = new OffsetDateTime(instant, offset)

    expect(dateTime.toLiteral()).toBe('2024-01-15T14:30:45.000Z')
  })

  test('should format positive offset correctly', () => {
    const instant = new Date('2024-01-15T14:30:45.000Z')
    const offset = TimeZoneOffsets.fromString('+05:30')
    const dateTime = new OffsetDateTime(instant, offset)

    expect(dateTime.toLiteral()).toBe('2024-01-15T20:00:45.000+05:30')
  })

  test('should format negative offset correctly', () => {
    const instant = new Date('2024-01-15T14:30:45.000Z')
    const offset = TimeZoneOffsets.fromString('-08:00')
    const dateTime = new OffsetDateTime(instant, offset)

    expect(dateTime.toLiteral()).toBe('2024-01-15T06:30:45.000-08:00')
  })

  test('should handle cross-day boundary with positive offset', () => {
    const instant = new Date('2024-02-28T23:30:00.000Z')
    const offset = TimeZoneOffsets.fromString('+02:00')
    const dateTime = new OffsetDateTime(instant, offset)

    expect(dateTime.toLiteral()).toBe('2024-02-29T01:30:00.000+02:00')
  })

  test('should handle cross-day boundary with negative offset', () => {
    const instant = new Date('2024-01-01T01:30:00.000Z')
    const offset = TimeZoneOffsets.fromString('-10:00')
    const dateTime = new OffsetDateTime(instant, offset)

    expect(dateTime.toLiteral()).toBe('2023-12-31T15:30:00.000-10:00')
  })
})

describe('OffsetDateTimes.addDuration', () => {
  test('should add duration correctly', () => {
    const instant = new Date('2024-07-15T14:30:45.123Z')
    const offset = TimeZoneOffsets.fromString('+05:30')
    const dateTime = new OffsetDateTime(instant, offset)
    const oneHour = Durations.fromHours(1)

    const result = OffsetDateTimes.addDuration(dateTime, oneHour)

    expect(result.instant).toEqual(new Date('2024-07-15T15:30:45.123Z'))
    expect(result.offset).toBe(offset)
  })

  test('should add duration across day boundary', () => {
    const instant = new Date('2024-07-15T23:30:00.000Z')
    const offset = TimeZoneOffsets.Utc
    const dateTime = new OffsetDateTime(instant, offset)
    const twoHours = Durations.fromHours(2)

    const result = OffsetDateTimes.addDuration(dateTime, twoHours)

    expect(result.instant).toEqual(new Date('2024-07-16T01:30:00.000Z'))
    expect(result.offset).toBe(offset)
  })

  test('should work with string input', () => {
    const literal = '2024-07-15T14:30:45.123Z'
    const oneDay = Durations.fromDays(1)

    const result = OffsetDateTimes.addDuration(literal, oneDay)

    expect(result.instant).toEqual(new Date('2024-07-16T14:30:45.123Z'))
  })
})

describe('OffsetDateTimes.subtractDuration', () => {
  test('should subtract duration correctly', () => {
    const instant = new Date('2024-07-15T14:30:45.123Z')
    const offset = TimeZoneOffsets.fromString('-04:00')
    const dateTime = new OffsetDateTime(instant, offset)
    const thirtyMinutes = Durations.fromMinutes(30)

    const result = OffsetDateTimes.subtractDuration(dateTime, thirtyMinutes)

    expect(result.instant).toEqual(new Date('2024-07-15T14:00:45.123Z'))
    expect(result.offset).toBe(offset)
  })

  test('should subtract duration across day boundary', () => {
    const instant = new Date('2024-07-15T01:30:00.000Z')
    const offset = TimeZoneOffsets.Utc
    const dateTime = new OffsetDateTime(instant, offset)
    const threeHours = Durations.fromHours(3)

    const result = OffsetDateTimes.subtractDuration(dateTime, threeHours)

    expect(result.instant).toEqual(new Date('2024-07-14T22:30:00.000Z'))
    expect(result.offset).toBe(offset)
  })
})

describe('OffsetDateTimes.isBefore', () => {
  test('should return true for earlier instant', () => {
    const earlier = new OffsetDateTime(new Date('2024-07-15T10:00:00.000Z'), TimeZoneOffsets.Utc)
    const later = new OffsetDateTime(new Date('2024-07-15T11:00:00.000Z'), TimeZoneOffsets.Utc)

    expect(OffsetDateTimes.isBefore(earlier, later)).toBe(true)
  })

  test('should return false for later instant', () => {
    const earlier = new OffsetDateTime(new Date('2024-07-15T10:00:00.000Z'), TimeZoneOffsets.Utc)
    const later = new OffsetDateTime(new Date('2024-07-15T11:00:00.000Z'), TimeZoneOffsets.Utc)

    expect(OffsetDateTimes.isBefore(later, earlier)).toBe(false)
  })

  test('should return false for same instant with different offsets', () => {
    const utc = new OffsetDateTime(new Date('2024-07-15T10:00:00.000Z'), TimeZoneOffsets.Utc)
    const est = new OffsetDateTime(new Date('2024-07-15T10:00:00.000Z'), TimeZoneOffsets.fromString('-05:00'))

    expect(OffsetDateTimes.isBefore(utc, est)).toBe(false)
    expect(OffsetDateTimes.isBefore(est, utc)).toBe(false)
  })
})

describe('OffsetDateTimes.isAfter', () => {
  test('should return true for later instant', () => {
    const earlier = new OffsetDateTime(new Date('2024-07-15T10:00:00.000Z'), TimeZoneOffsets.Utc)
    const later = new OffsetDateTime(new Date('2024-07-15T11:00:00.000Z'), TimeZoneOffsets.Utc)

    expect(OffsetDateTimes.isAfter(later, earlier)).toBe(true)
  })

  test('should return false for earlier instant', () => {
    const earlier = new OffsetDateTime(new Date('2024-07-15T10:00:00.000Z'), TimeZoneOffsets.Utc)
    const later = new OffsetDateTime(new Date('2024-07-15T11:00:00.000Z'), TimeZoneOffsets.Utc)

    expect(OffsetDateTimes.isAfter(earlier, later)).toBe(false)
  })
})

describe('OffsetDateTimes.timeUntil', () => {
  test('should calculate positive duration for future instant', () => {
    const now = new OffsetDateTime(new Date('2024-07-15T10:00:00.000Z'), TimeZoneOffsets.Utc)
    const future = new OffsetDateTime(new Date('2024-07-15T12:00:00.000Z'), TimeZoneOffsets.Utc)

    const result = OffsetDateTimes.timeUntil(now, future)

    expect(result).toBe(Durations.fromHours(2))
  })

  test('should calculate negative duration for past instant', () => {
    const now = new OffsetDateTime(new Date('2024-07-15T10:00:00.000Z'), TimeZoneOffsets.Utc)
    const past = new OffsetDateTime(new Date('2024-07-15T08:00:00.000Z'), TimeZoneOffsets.Utc)

    const result = OffsetDateTimes.timeUntil(now, past)

    expect(result).toBe(Durations.fromHours(-2))
  })

  test('should work with different offsets', () => {
    const utc = new OffsetDateTime(new Date('2024-07-15T10:00:00.000Z'), TimeZoneOffsets.Utc)
    const est = new OffsetDateTime(new Date('2024-07-15T11:00:00.000Z'), TimeZoneOffsets.fromString('-05:00'))

    const result = OffsetDateTimes.timeUntil(utc, est)

    expect(result).toBe(Durations.fromHours(1))
  })
})

describe('OffsetDateTimes.timeBetween', () => {
  test('should calculate absolute duration between instants', () => {
    const first = new OffsetDateTime(new Date('2024-07-15T10:00:00.000Z'), TimeZoneOffsets.Utc)
    const second = new OffsetDateTime(new Date('2024-07-15T12:00:00.000Z'), TimeZoneOffsets.Utc)

    const result1 = OffsetDateTimes.timeBetween(first, second)
    const result2 = OffsetDateTimes.timeBetween(second, first)

    expect(result1).toBe(Durations.fromHours(2))
    expect(result2).toBe(Durations.fromHours(2))
  })

  test('should return zero for same instant', () => {
    const instant = new Date('2024-07-15T10:00:00.000Z')
    const first = new OffsetDateTime(instant, TimeZoneOffsets.Utc)
    const second = new OffsetDateTime(instant, TimeZoneOffsets.fromString('+05:00'))

    const result = OffsetDateTimes.timeBetween(first, second)

    expect(result).toBe(Durations.Zero)
  })
})
