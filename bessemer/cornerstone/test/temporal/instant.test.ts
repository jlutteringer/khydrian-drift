import { Clocks, Durations, Instants, Locales, TimeZoneIds } from '@bessemer/cornerstone'
import { Temporal } from '@js-temporal/polyfill'
import { TimeUnit } from '@bessemer/cornerstone/temporal/chrono'

describe('Instants.from', () => {
  test('should return Instant instance as-is', () => {
    const instant = Temporal.Instant.from('2024-07-15T14:30:45.123Z')
    const result = Instants.from(instant)
    expect(result).toBe(instant)
  })

  test('should create Instant from a literal', () => {
    const result = Instants.from(Instants.toLiteral(Instants.from('2024-07-15T14:30:45.123Z')))
    expect(result).toBeInstanceOf(Temporal.Instant)
    expect(result.epochMilliseconds).toBe(1721053845123)
  })

  test('should create Instant from Date', () => {
    const date = new Date('2024-07-15T14:30:45.123Z')
    const result = Instants.from(date)
    expect(result).toBeInstanceOf(Temporal.Instant)
    expect(result.epochMilliseconds).toBe(date.getTime())
  })

  test('should parse valid instant string', () => {
    const result = Instants.from('2024-07-15T14:30:45.123Z')
    expect(result.epochMilliseconds).toBe(1721053845123)
  })

  test('should throw on invalid string', () => {
    expect(() => Instants.from('invalid-instant')).toThrow()
  })
})

describe('Instants.parseString', () => {
  test('should parse valid ISO 8601 instant string', () => {
    const result = Instants.parseString('2024-07-15T14:30:45.123Z')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value.epochMilliseconds).toBe(1721053845123)
    }
  })

  test('should parse instant string without milliseconds', () => {
    const result = Instants.parseString('2024-07-15T14:30:45Z')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value.epochMilliseconds).toBe(1721053845000)
    }
  })

  test('should parse instant with timezone offset', () => {
    const result = Instants.parseString('2024-07-15T10:30:45-04:00')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value.epochMilliseconds).toBe(1721053845000) // Same as UTC equivalent
    }
  })

  test('should fail on invalid instant format', () => {
    const result = Instants.parseString('invalid-instant')
    expect(result.isSuccess).toBe(false)
  })

  test('should fail on empty string', () => {
    const result = Instants.parseString('')
    expect(result.isSuccess).toBe(false)
  })

  test('should fail on date-only string', () => {
    const result = Instants.parseString('2024-07-15')
    expect(result.isSuccess).toBe(false)
  })
})

describe('Instants.toLiteral', () => {
  test('should convert Instant to ISO 8601 string', () => {
    const instant = Instants.from('2024-07-15T14:30:45.123Z')
    const result = Instants.toLiteral(instant)
    expect(result).toBe('2024-07-15T14:30:45.123Z')
  })

  test('should handle instant without milliseconds', () => {
    const instant = Instants.from('2024-07-15T14:30:45Z')
    const result = Instants.toLiteral(instant)
    expect(result).toBe('2024-07-15T14:30:45Z')
  })

  test('should maintain precision for microseconds', () => {
    const instant = Temporal.Instant.from('2024-07-15T14:30:45.123456Z')
    const result = Instants.toLiteral(instant)
    expect(result).toBe('2024-07-15T14:30:45.123456Z')
  })
})

describe('Instants.toDate', () => {
  test('should convert Instant to Date', () => {
    const instant = Instants.from('2024-07-15T14:30:45.123Z')
    const result = Instants.toDate(instant)
    expect(result).toBeInstanceOf(Date)
    expect(result.getTime()).toBe(instant.epochMilliseconds)
    expect(result.toISOString()).toBe('2024-07-15T14:30:45.123Z')
  })

  test('should handle instant at epoch', () => {
    const instant = Temporal.Instant.fromEpochMilliseconds(0)
    const result = Instants.toDate(instant)
    expect(result.getTime()).toBe(0)
  })

  test('should handle future instant', () => {
    const instant = Instants.from('2030-12-31T23:59:59.999Z')
    const result = Instants.toDate(instant)
    expect(result.getTime()).toBe(instant.epochMilliseconds)
  })
})

describe('Instants.isInstant', () => {
  test('should return true for Instant instance', () => {
    const instant = Instants.from('2024-07-15T14:30:45.123Z')
    expect(Instants.isInstant(instant)).toBe(true)
  })

  test('should return false for non-Instant values', () => {
    expect(Instants.isInstant('2024-07-15T14:30:45.123Z')).toBe(false)
    expect(Instants.isInstant(new Date())).toBe(false)
    expect(Instants.isInstant(null)).toBe(false)
    expect(Instants.isInstant(undefined)).toBe(false)
    expect(Instants.isInstant(123456789)).toBe(false)
  })
})

describe('Instants.now', () => {
  test('should return current instant with default clock', () => {
    const before = Temporal.Now.instant()
    const result = Instants.now()
    const after = Temporal.Now.instant()
    expect(result).toBeInstanceOf(Temporal.Instant)
    expect(Instants.isAfter(result, before) || Instants.isEqual(result, before)).toBe(true)
    expect(Instants.isBefore(result, after) || Instants.isEqual(result, after)).toBe(true)
  })

  test('should return fixed instant with fixed clock', () => {
    const fixedInstant = Instants.from('2024-07-15T14:30:45.123Z')
    const clock = Clocks.fixed(fixedInstant)
    const result = Instants.now(clock)
    expect(result).toEqual(fixedInstant)
  })

  test('should respect clock timezone (though instant itself is timezone-agnostic)', () => {
    const fixedInstant = Instants.from('2024-07-15T14:30:45.123Z')
    const utcClock = Clocks.fixed(fixedInstant, TimeZoneIds.Utc)
    const nyClock = Clocks.fixed(fixedInstant, TimeZoneIds.from('America/New_York'))

    const utcResult = Instants.now(utcClock)
    const nyResult = Instants.now(nyClock)

    // Both should return the same instant since Instant is timezone-agnostic
    expect(utcResult).toEqual(nyResult)
    expect(utcResult).toEqual(fixedInstant)
  })
})

describe('Instants.add', () => {
  test('should add duration to instant', () => {
    const instant = Instants.from('2024-07-15T14:30:45.123Z')
    const duration = Durations.fromHours(2)
    const result = Instants.add(instant, duration)
    expect(result).toBeInstanceOf(Temporal.Instant)
    expect(Instants.toLiteral(result)).toBe('2024-07-15T16:30:45.123Z')
  })

  test('should add complex duration', () => {
    const instant = Instants.from('2024-07-15T10:15:30.500Z')
    const duration = Durations.add(Durations.fromHours(1), Durations.fromMinutes(20), Durations.fromSeconds(15), Durations.fromMilliseconds(250))
    const result = Instants.add(instant, duration)
    expect(Instants.toLiteral(result)).toBe('2024-07-15T11:35:45.75Z')
  })

  test('should work with Date input', () => {
    const date = new Date('2024-07-15T14:30:45.123Z')
    const duration = Durations.fromMinutes(30)
    const result = Instants.add(date, duration)
    expect(Instants.toLiteral(result)).toBe('2024-07-15T15:00:45.123Z')
  })

  test('should handle negative durations', () => {
    const instant = Instants.from('2024-07-15T14:30:45.123Z')
    const duration = Durations.fromHours(-2)
    const result = Instants.add(instant, duration)
    expect(Instants.toLiteral(result)).toBe('2024-07-15T12:30:45.123Z')
  })
})

describe('Instants.subtract', () => {
  test('should subtract duration from instant', () => {
    const instant = Instants.from('2024-07-15T16:30:45.123Z')
    const duration = Durations.fromHours(2)
    const result = Instants.subtract(instant, duration)
    expect(Instants.toLiteral(result)).toBe('2024-07-15T14:30:45.123Z')
  })

  test('should subtract complex duration', () => {
    const instant = Instants.from('2024-07-15T11:35:45.750Z')
    const duration = Durations.add(Durations.fromHours(1), Durations.fromMinutes(20), Durations.fromSeconds(15), Durations.fromMilliseconds(250))
    const result = Instants.subtract(instant, duration)
    expect(Instants.toLiteral(result)).toBe('2024-07-15T10:15:30.5Z')
  })

  test('should work with Date input', () => {
    const date = new Date('2024-07-15T15:00:45.123Z')
    const duration = Durations.fromMinutes(30)
    const result = Instants.subtract(date, duration)
    expect(Instants.toLiteral(result)).toBe('2024-07-15T14:30:45.123Z')
  })

  test('should handle negative durations (becomes addition)', () => {
    const instant = Instants.from('2024-07-15T14:30:45.123Z')
    const duration = Durations.fromHours(-2)
    const result = Instants.subtract(instant, duration)
    expect(Instants.toLiteral(result)).toBe('2024-07-15T16:30:45.123Z')
  })
})

describe('Instants.until', () => {
  test('should calculate duration between instants', () => {
    const earlier = Instants.from('2024-07-15T14:30:45.123Z')
    const later = Instants.from('2024-07-15T16:30:45.123Z')
    const result = Instants.until(earlier, later)
    expect(Durations.toHours(result)).toBe(2)
  })

  test('should handle negative duration for reversed order', () => {
    const earlier = Instants.from('2024-07-15T14:30:45.123Z')
    const later = Instants.from('2024-07-15T16:30:45.123Z')
    const result = Instants.until(later, earlier)
    expect(Durations.toHours(result)).toBe(-2)
  })

  test('should return zero duration for same instant', () => {
    const instant = Instants.from('2024-07-15T14:30:45.123Z')
    const result = Instants.until(instant, instant)
    expect(Durations.isZero(result)).toBe(true)
  })

  test('should work with Date inputs', () => {
    const date1 = new Date('2024-07-15T14:30:45.123Z')
    const date2 = new Date('2024-07-15T15:30:45.123Z')
    const result = Instants.until(date1, date2)
    expect(Durations.toHours(result)).toBe(1)
  })

  test('should calculate complex durations', () => {
    const start = Instants.from('2024-07-15T10:15:30.500Z')
    const end = Instants.from('2024-07-15T11:35:45.750Z')
    const result = Instants.until(start, end)
    expect(Durations.toMilliseconds(result)).toBe(4815250) // 1h 20m 15.25s in milliseconds
  })
})

describe('Instants.round', () => {
  test('should round to nearest second', () => {
    const instant = Instants.from('2024-07-15T14:30:45.750Z')
    const result = Instants.round(instant, TimeUnit.Second)
    expect(Instants.toLiteral(result)).toBe('2024-07-15T14:30:46Z')
  })

  test('should round to nearest minute', () => {
    const instant = Instants.from('2024-07-15T14:30:45.123Z')
    const result = Instants.round(instant, TimeUnit.Minute)
    expect(Instants.toLiteral(result)).toBe('2024-07-15T14:31:00Z')
  })

  test('should round to nearest hour', () => {
    const instant = Instants.from('2024-07-15T14:35:45.123Z')
    const result = Instants.round(instant, TimeUnit.Hour)
    expect(Instants.toLiteral(result)).toBe('2024-07-15T15:00:00Z')
  })

  test('should round down when exactly halfway', () => {
    const instant = Instants.from('2024-07-15T14:30:30.000Z')
    const result = Instants.round(instant, TimeUnit.Minute)
    expect(Instants.toLiteral(result)).toBe('2024-07-15T14:31:00Z')
  })
})

describe('Instants.isEqual', () => {
  test('should return true for equal instants', () => {
    const instant1 = Instants.from('2024-07-15T14:30:45.123Z')
    const instant2 = Instants.from('2024-07-15T14:30:45.123Z')
    expect(Instants.isEqual(instant1, instant2)).toBe(true)
  })

  test('should return false for different instants', () => {
    const instant1 = Instants.from('2024-07-15T14:30:45.123Z')
    const instant2 = Instants.from('2024-07-15T14:30:45.124Z')
    expect(Instants.isEqual(instant1, instant2)).toBe(false)
  })

  test('should work with Date inputs', () => {
    const date1 = new Date('2024-07-15T14:30:45.123Z')
    const date2 = new Date('2024-07-15T14:30:45.123Z')
    expect(Instants.isEqual(date1, date2)).toBe(true)
  })
})

describe('Instants.isBefore', () => {
  test('should return true when first instant is before second', () => {
    const earlier = Instants.from('2024-07-15T14:30:45.123Z')
    const later = Instants.from('2024-07-15T14:30:45.124Z')
    expect(Instants.isBefore(earlier, later)).toBe(true)
  })

  test('should return false when first instant is after second', () => {
    const earlier = Instants.from('2024-07-15T14:30:45.123Z')
    const later = Instants.from('2024-07-15T14:30:45.124Z')
    expect(Instants.isBefore(later, earlier)).toBe(false)
  })

  test('should return false when instants are equal', () => {
    const instant1 = Instants.from('2024-07-15T14:30:45.123Z')
    const instant2 = Instants.from('2024-07-15T14:30:45.123Z')
    expect(Instants.isBefore(instant1, instant2)).toBe(false)
  })

  test('should work with Date inputs', () => {
    const date1 = new Date('2024-07-15T14:30:45.123Z')
    const date2 = new Date('2024-07-15T14:30:45.124Z')
    expect(Instants.isBefore(date1, date2)).toBe(true)
  })

  test('should handle large time differences', () => {
    const past = Instants.from('2020-01-01T00:00:00Z')
    const future = Instants.from('2030-12-31T23:59:59Z')
    expect(Instants.isBefore(past, future)).toBe(true)
  })
})

describe('Instants.isAfter', () => {
  test('should return true when first instant is after second', () => {
    const earlier = Instants.from('2024-07-15T14:30:45.123Z')
    const later = Instants.from('2024-07-15T14:30:45.124Z')
    expect(Instants.isAfter(later, earlier)).toBe(true)
  })

  test('should return false when first instant is before second', () => {
    const earlier = Instants.from('2024-07-15T14:30:45.123Z')
    const later = Instants.from('2024-07-15T14:30:45.124Z')
    expect(Instants.isAfter(earlier, later)).toBe(false)
  })

  test('should return false when instants are equal', () => {
    const instant1 = Instants.from('2024-07-15T14:30:45.123Z')
    const instant2 = Instants.from('2024-07-15T14:30:45.123Z')
    expect(Instants.isAfter(instant1, instant2)).toBe(false)
  })
})

describe('Instants.CompareBy', () => {
  test('should return negative number when first is before second', () => {
    const earlier = Instants.from('2024-07-15T14:30:45.123Z')
    const later = Instants.from('2024-07-15T14:30:45.124Z')
    expect(Instants.CompareBy(earlier, later)).toBeLessThan(0)
  })

  test('should return positive number when first is after second', () => {
    const earlier = Instants.from('2024-07-15T14:30:45.123Z')
    const later = Instants.from('2024-07-15T14:30:45.124Z')
    expect(Instants.CompareBy(later, earlier)).toBeGreaterThan(0)
  })

  test('should return zero when instants are equal', () => {
    const instant1 = Instants.from('2024-07-15T14:30:45.123Z')
    const instant2 = Instants.from('2024-07-15T14:30:45.123Z')
    expect(Instants.CompareBy(instant1, instant2)).toBe(0)
  })
})

describe('Instants.EqualBy', () => {
  test('should return true for equal instants', () => {
    const instant1 = Instants.from('2024-07-15T14:30:45.123Z')
    const instant2 = Instants.from('2024-07-15T14:30:45.123Z')
    expect(Instants.EqualBy(instant1, instant2)).toBe(true)
  })

  test('should return false for different instants', () => {
    const instant1 = Instants.from('2024-07-15T14:30:45.123Z')
    const instant2 = Instants.from('2024-07-15T14:30:45.124Z')
    expect(Instants.EqualBy(instant1, instant2)).toBe(false)
  })
})

describe('Instants.format', () => {
  test('should format instant with date and time in US locale', () => {
    const instant = Instants.from('2023-12-25T14:30:45Z')
    const result = Instants.format(instant, TimeZoneIds.Utc, Locales.AmericanEnglish, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })

    expect(result).toContain('12/25/2023')
    expect(result).toContain('2:30')
    expect(result).toContain('PM')
  })

  test('should format instant in different timezone', () => {
    const instant = Instants.from('2023-12-25T14:30:45Z')
    const utcResult = Instants.format(instant, TimeZoneIds.Utc, Locales.AmericanEnglish, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false,
    })

    // Should show 14:30 in UTC
    expect(utcResult).toContain('14:30')
  })

  test('should work with different locales', () => {
    const instant = Instants.from('2023-12-25T14:30:45Z')

    const usResult = Instants.format(instant, TimeZoneIds.Utc, Locales.AmericanEnglish, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const deResult = Instants.format(instant, TimeZoneIds.Utc, Locales.German, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // Should be different due to locale
    expect(usResult).not.toBe(deResult)
    expect(usResult).toContain('December')
    expect(deResult).toContain('Dezember')
  })

  test('should format with various date options', () => {
    const instant = Instants.from('2023-12-25T14:30:45Z')

    const shortDate = Instants.format(instant, TimeZoneIds.Utc, Locales.AmericanEnglish, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    expect(shortDate).toContain('Dec')
    expect(shortDate).toContain('25')
    expect(shortDate).toContain('2023')
  })

  test('should format time only options', () => {
    const instant = Instants.from('2023-12-25T09:15:30Z')

    const timeOnly = Instants.format(instant, TimeZoneIds.Utc, Locales.AmericanEnglish, {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    })

    expect(timeOnly).toContain('9:15:30')
    expect(timeOnly).toContain('AM')
  })

  test('should format with weekday options', () => {
    const instant = Instants.from('2023-12-25T12:00:00Z') // Christmas 2023 is a Monday

    const withWeekday = Instants.format(instant, TimeZoneIds.Utc, Locales.AmericanEnglish, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    expect(withWeekday).toContain('Monday')
    expect(withWeekday).toContain('December')
  })

  test('should handle 24-hour format', () => {
    const instant = Instants.from('2023-12-25T23:45:00Z')

    const result = Instants.format(instant, TimeZoneIds.Utc, Locales.AmericanEnglish, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

    expect(result).toContain('23:45')
    expect(result).not.toContain('PM')
  })
})
