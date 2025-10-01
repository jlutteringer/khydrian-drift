import { Durations, TimeZoneIds } from '@bessemer/cornerstone'

describe('TimeZoneId.fromString', () => {
  test('should normalize valid IANA timezone identifiers', () => {
    {
      const result = TimeZoneIds.fromString('America/New_York')
      expect(result).toBe('America/New_York')
    }

    {
      const result = TimeZoneIds.fromString('america/new_york')
      expect(result).toBe('America/New_York')
    }

    {
      const result = TimeZoneIds.fromString('AMERICA/NEW_YORK')
      expect(result).toBe('America/New_York')
    }
  })

  test('should handle UTC timezone', () => {
    const result = TimeZoneIds.fromString('UTC')
    expect(result).toBe('UTC')
  })

  test('should normalize timezone aliases', () => {
    // GMT should normalize to UTC
    const result = TimeZoneIds.fromString('GMT')
    expect(result).toBe('UTC')
  })

  test('should handle common timezone identifiers', () => {
    const testCases = ['Europe/London', 'Asia/Tokyo', 'Australia/Sydney', 'America/Los_Angeles', 'Europe/Paris', 'Asia/Shanghai']

    testCases.forEach((timezone) => {
      expect(() => TimeZoneIds.fromString(timezone)).not.toThrow()
      const result = TimeZoneIds.fromString(timezone)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  test('should throw for invalid timezone identifiers', () => {
    const invalidTimezones = ['Invalid/Timezone', 'America/NonExistent', 'Europe/FakeCity', 'Random/String', '']

    invalidTimezones.forEach((timezone) => {
      expect(() => TimeZoneIds.fromString(timezone)).toThrow()
    })
  })
})

describe('TimeZoneId.parseString', () => {
  test('should return success for valid timezone identifiers', () => {
    const result = TimeZoneIds.parseString('America/New_York')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe('America/New_York')
    }
  })

  test('should return success for UTC', () => {
    const result = TimeZoneIds.parseString('UTC')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe('UTC')
    }
  })

  test('should normalize GMT to UTC', () => {
    const result = TimeZoneIds.parseString('GMT')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe('UTC')
    }
  })

  test('should return failure for invalid timezone identifiers', () => {
    const invalidTimezones = ['Invalid/Timezone', 'America/NonExistent', 'Random/String', '']

    invalidTimezones.forEach((timezone) => {
      const result = TimeZoneIds.parseString(timezone)
      expect(result.isSuccess).toBe(false)
    })
  })

  test('should handle common valid timezones', () => {
    const validTimezones = [
      'Europe/London',
      'Asia/Tokyo',
      'Australia/Sydney',
      'America/Los_Angeles',
      'America/Chicago',
      'Europe/Paris',
      'Asia/Shanghai',
      'Pacific/Auckland',
    ]

    validTimezones.forEach((timezone) => {
      const result = TimeZoneIds.parseString(timezone)
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(typeof result.value).toBe('string')
        expect(result.value.length).toBeGreaterThan(0)
      }
    })
  })
})

describe('TimeZoneIds.getOffset', () => {
  test('should return zero offset for UTC', () => {
    const instant = new Date('2024-07-15T12:00:00Z')
    const offset = TimeZoneIds.getOffset(TimeZoneIds.Utc, instant)
    expect(offset).toBe(0)
  })

  test('should return correct offset for America/New_York in summer (EDT)', () => {
    const instant = new Date('2024-07-15T12:00:00Z') // Summer time
    const offset = TimeZoneIds.getOffset(TimeZoneIds.fromString('America/New_York'), instant)
    expect(offset).toBe(Durations.fromHours(-4)) // EDT is UTC-4
  })

  test('should return correct offset for America/New_York in winter (EST)', () => {
    const instant = new Date('2024-01-15T12:00:00Z') // Winter time
    const offset = TimeZoneIds.getOffset(TimeZoneIds.fromString('America/New_York'), instant)
    expect(offset).toBe(Durations.fromHours(-5)) // EST is UTC-5
  })

  test('should return correct offset for Europe/London in summer (BST)', () => {
    const instant = new Date('2024-07-15T12:00:00Z') // Summer time
    const offset = TimeZoneIds.getOffset(TimeZoneIds.fromString('Europe/London'), instant)
    expect(offset).toBe(Durations.fromHours(1)) // BST is UTC+1
  })

  test('should return correct offset for Europe/London in winter (GMT)', () => {
    const instant = new Date('2024-01-15T12:00:00Z') // Winter time
    const offset = TimeZoneIds.getOffset(TimeZoneIds.fromString('Europe/London'), instant)
    expect(offset).toBe(0) // GMT is UTC+0
  })

  test('should return correct offset for Asia/Tokyo', () => {
    const instant = new Date('2024-07-15T12:00:00Z')
    const offset = TimeZoneIds.getOffset(TimeZoneIds.fromString('Asia/Tokyo'), instant)
    expect(offset).toBe(Durations.fromHours(9)) // JST is always UTC+9
  })

  test('should return correct offset for Australia/Sydney in summer (AEDT)', () => {
    const instant = new Date('2024-01-15T12:00:00Z') // Summer time in southern hemisphere
    const offset = TimeZoneIds.getOffset(TimeZoneIds.fromString('Australia/Sydney'), instant)
    expect(offset).toBe(Durations.fromHours(11)) // AEDT is UTC+11
  })

  test('should return correct offset for Australia/Sydney in winter (AEST)', () => {
    const instant = new Date('2024-07-15T12:00:00Z') // Winter time in southern hemisphere
    const offset = TimeZoneIds.getOffset(TimeZoneIds.fromString('Australia/Sydney'), instant)
    expect(offset).toBe(Durations.fromHours(10)) // AEST is UTC+10
  })

  test('should return correct offset for Asia/Kolkata (half-hour offset)', () => {
    const instant = new Date('2024-07-15T12:00:00Z')
    const offset = TimeZoneIds.getOffset(TimeZoneIds.fromString('Asia/Kolkata'), instant)
    expect(offset).toBe(Durations.fromHours(5) + Durations.fromMinutes(30)) // IST is UTC+5:30
  })

  test('should return correct offset for America/Los_Angeles in summer (PDT)', () => {
    const instant = new Date('2024-07-15T12:00:00Z') // Summer time
    const offset = TimeZoneIds.getOffset(TimeZoneIds.fromString('America/Los_Angeles'), instant)
    expect(offset).toBe(-Durations.fromHours(7)) // PDT is UTC-7
  })

  test('should return correct offset for America/Los_Angeles in winter (PST)', () => {
    const instant = new Date('2024-01-15T12:00:00Z') // Winter time
    const offset = TimeZoneIds.getOffset(TimeZoneIds.fromString('America/Los_Angeles'), instant)
    expect(offset).toBe(-Durations.fromHours(8)) // PST is UTC-8
  })

  test('should handle DST transition dates correctly', () => {
    // Test a few hours before and after DST transition in 2024
    // Spring forward in US: March 10, 2024, 2:00 AM -> 3:00 AM
    const beforeSpringTransition = new Date('2024-03-10T06:00:00Z') // 1:00 AM EST
    const afterSpringTransition = new Date('2024-03-10T08:00:00Z') // 4:00 AM EDT (3:00 AM doesn't exist)

    const offsetBefore = TimeZoneIds.getOffset(TimeZoneIds.fromString('America/New_York'), beforeSpringTransition)
    const offsetAfter = TimeZoneIds.getOffset(TimeZoneIds.fromString('America/New_York'), afterSpringTransition)

    expect(offsetBefore).toBe(-Durations.fromHours(5)) // EST
    expect(offsetAfter).toBe(-Durations.fromHours(4)) // EDT
  })

  test('should handle fall back DST transition correctly', () => {
    // Fall back in US: November 3, 2024, 2:00 AM -> 1:00 AM
    const beforeFallTransition = new Date('2024-11-03T05:00:00Z') // 1:00 AM EDT
    const afterFallTransition = new Date('2024-11-03T07:00:00Z') // 2:00 AM EST

    const offsetBefore = TimeZoneIds.getOffset(TimeZoneIds.fromString('America/New_York'), beforeFallTransition)
    const offsetAfter = TimeZoneIds.getOffset(TimeZoneIds.fromString('America/New_York'), afterFallTransition)

    expect(offsetBefore).toBe(-Durations.fromHours(4)) // EDT
    expect(offsetAfter).toBe(-Durations.fromHours(5)) // EST
  })

  test('should work with different instant values on same timezone', () => {
    const timeZone = TimeZoneIds.fromString('Europe/Paris')
    const instant1 = new Date('2024-01-01T00:00:00Z')
    const instant2 = new Date('2024-06-01T00:00:00Z')
    const instant3 = new Date('2024-12-31T23:59:59Z')

    const offset1 = TimeZoneIds.getOffset(timeZone, instant1)
    const offset2 = TimeZoneIds.getOffset(timeZone, instant2)
    const offset3 = TimeZoneIds.getOffset(timeZone, instant3)

    expect(offset1).toBe(Durations.fromHours(1)) // CET (winter)
    expect(offset2).toBe(Durations.fromHours(2)) // CEST (summer)
    expect(offset3).toBe(Durations.fromHours(1)) // CET (winter)
  })

  test('should handle extreme positive offset timezone', () => {
    const instant = new Date('2024-07-15T12:00:00Z')
    const offset = TimeZoneIds.getOffset(TimeZoneIds.fromString('Pacific/Kiritimati'), instant)
    expect(offset).toBe(Durations.fromHours(14)) // UTC+14
  })

  test('should handle extreme negative offset timezone', () => {
    const instant = new Date('2024-07-15T12:00:00Z')
    const offset = TimeZoneIds.getOffset(TimeZoneIds.fromString('Pacific/Marquesas'), instant)
    expect(offset).toBe(-Durations.fromHours(9) - Durations.fromMinutes(30)) // UTC-9:30
  })

  test('should handle millisecond precision instants', () => {
    const instant1 = new Date('2024-07-15T12:00:00.000Z')
    const instant2 = new Date('2024-07-15T12:10:10.999Z')

    const offset1 = TimeZoneIds.getOffset(TimeZoneIds.fromString('America/New_York'), instant1)
    const offset2 = TimeZoneIds.getOffset(TimeZoneIds.fromString('America/New_York'), instant2)

    // Offsets should be the same since they're within the same minute
    expect(offset1).toBe(offset2)
    expect(offset1).toBe(Durations.fromHours(-4)) // EDT
  })
})
