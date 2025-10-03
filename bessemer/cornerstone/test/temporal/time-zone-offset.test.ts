import { Durations, Instants, TimeZoneIds, TimeZoneOffsets } from '@bessemer/cornerstone'

describe('TimeZoneOffset.fromDuration', () => {
  test('should create TimeZoneOffset for valid values', () => {
    expect(TimeZoneOffsets.fromDuration(Durations.Zero)).toBe(0)
    expect(TimeZoneOffsets.fromDuration({ hours: 5 })).toBe(Durations.toMinutes({ hours: 5 }))
    expect(TimeZoneOffsets.fromDuration({ hours: -8 })).toBe(Durations.toMinutes({ hours: -8 }))
  })

  test('should accept maximum positive offset (+18:00)', () => {
    const eighteenHours = Durations.fromHours(18)
    expect(TimeZoneOffsets.fromDuration(eighteenHours)).toBe(Durations.toMinutes(eighteenHours))
  })

  test('should accept maximum negative offset (-18:00)', () => {
    const minusEighteenHours = Durations.fromHours(-18)
    expect(TimeZoneOffsets.fromDuration(minusEighteenHours)).toBe(Durations.toMinutes(minusEighteenHours))
  })

  test('should throw for values exceeding +18:00', () => {
    const overEighteenHours = Durations.from({ hours: 1, milliseconds: 1 })
    expect(() => TimeZoneOffsets.fromDuration(overEighteenHours)).toThrow()
  })

  test('should throw for values below -18:00', () => {
    const underMinusEighteenHours = Durations.from({ hours: -1, milliseconds: -1 })
    expect(() => TimeZoneOffsets.fromDuration(underMinusEighteenHours)).toThrow()
  })
})

describe('TimeZoneOffset.parseString', () => {
  test('should parse Z as UTC (0 offset)', () => {
    const result = TimeZoneOffsets.parseString('Z')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe(0)
    }
  })

  test('should parse +h format', () => {
    const result = TimeZoneOffsets.parseString('+5')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe(TimeZoneOffsets.fromDuration({ hours: 5 }))
    }
  })

  test('should parse -h format', () => {
    const result = TimeZoneOffsets.parseString('-3')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe(TimeZoneOffsets.fromDuration({ hours: -3 }))
    }
  })

  test('should parse +hh format', () => {
    const result = TimeZoneOffsets.parseString('+05')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe(TimeZoneOffsets.fromDuration({ hours: 5 }))
    }
  })

  test('should parse -hh format', () => {
    const result = TimeZoneOffsets.parseString('-08')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe(TimeZoneOffsets.fromDuration({ hours: -8 }))
    }
  })

  test('should parse +hh:mm format', () => {
    const result = TimeZoneOffsets.parseString('+05:30')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe(TimeZoneOffsets.fromDuration({ hours: 5, minutes: 30 }))
    }
  })

  test('should parse -hh:mm format', () => {
    const result = TimeZoneOffsets.parseString('-08:45')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe(TimeZoneOffsets.fromDuration({ hours: -8, minutes: -45 }))
    }
  })

  test('should parse +hhmm format', () => {
    const result = TimeZoneOffsets.parseString('+0530')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe(TimeZoneOffsets.fromDuration({ hours: 5, minutes: 30 }))
    }
  })

  test('should parse -hhmm format', () => {
    const result = TimeZoneOffsets.parseString('-0845')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe(TimeZoneOffsets.fromDuration({ hours: -8, minutes: -45 }))
    }
  })

  test('should not parse +hh:mm:ss format', () => {
    const result = TimeZoneOffsets.parseString('+05:30:15')
    expect(result.isSuccess).toBe(false)
  })

  test('should not parse -hh:mm:ss format', () => {
    const result = TimeZoneOffsets.parseString('-08:45:30')
    expect(result.isSuccess).toBe(false)
  })

  test('should not parse +hhmmss format', () => {
    const result = TimeZoneOffsets.parseString('+053015')
    expect(result.isSuccess).toBe(false)
  })

  test('should not parse -hhmmss format', () => {
    const result = TimeZoneOffsets.parseString('-084530')
    expect(result.isSuccess).toBe(false)
  })

  test('should parse maximum positive offset (+18:00)', () => {
    const result = TimeZoneOffsets.parseString('+18:00')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe(TimeZoneOffsets.fromDuration({ hours: 18 }))
    }
  })

  test('should parse maximum negative offset (-18:00)', () => {
    const result = TimeZoneOffsets.parseString('-18:00')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe(TimeZoneOffsets.fromDuration({ hours: -18 }))
    }
  })

  test('should reject offset exceeding +18:00', () => {
    const result = TimeZoneOffsets.parseString('+19:00')
    expect(result.isSuccess).toBe(false)
  })

  test('should reject offset below -18:00', () => {
    const result = TimeZoneOffsets.parseString('-19:00')
    expect(result.isSuccess).toBe(false)
  })

  test('should reject invalid format without sign', () => {
    const result = TimeZoneOffsets.parseString('0500')
    expect(result.isSuccess).toBe(false)
  })

  test('should reject invalid minutes (>= 60)', () => {
    const result = TimeZoneOffsets.parseString('+05:60')
    expect(result.isSuccess).toBe(false)
  })

  test('should reject invalid seconds (>= 60)', () => {
    const result = TimeZoneOffsets.parseString('+05:30:60')
    expect(result.isSuccess).toBe(false)
  })

  test('should reject non-numeric hours', () => {
    const result = TimeZoneOffsets.parseString('+aa')
    expect(result.isSuccess).toBe(false)
  })

  test('should reject non-numeric minutes', () => {
    const result = TimeZoneOffsets.parseString('+05:aa')
    expect(result.isSuccess).toBe(false)
  })

  test('should reject invalid colon format', () => {
    const result = TimeZoneOffsets.parseString('+05:')
    expect(result.isSuccess).toBe(false)
  })

  test('should reject wrong length format', () => {
    const result = TimeZoneOffsets.parseString('+123')
    expect(result.isSuccess).toBe(false)
  })

  test('should handle common positive offsets', () => {
    const testCases = [
      { input: '+01:00', expected: Durations.fromHours(1) }, // CET
      { input: '+05:30', expected: Durations.from({ hours: 5, minutes: 30 }) }, // IST
      { input: '+09:00', expected: Durations.fromHours(9) }, // JST/KST
      { input: '+12:00', expected: Durations.fromHours(12) }, // NZST
    ]

    testCases.forEach(({ input, expected }) => {
      const result = TimeZoneOffsets.parseString(input)
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value).toBe(TimeZoneOffsets.fromDuration(expected))
      }
    })
  })

  test('should handle common negative offsets', () => {
    const testCases = [
      { input: '-05:00', expected: Durations.fromHours(-5) }, // EST
      { input: '-08:00', expected: Durations.fromHours(-8) }, // PST
      { input: '-10:00', expected: Durations.fromHours(-10) }, // HST
    ]

    testCases.forEach(({ input, expected }) => {
      const result = TimeZoneOffsets.parseString(input)
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value).toBe(TimeZoneOffsets.fromDuration(expected))
      }
    })
  })
})

describe('TimeZoneOffset.fromString', () => {
  test('should throw for invalid formats', () => {
    expect(() => TimeZoneOffsets.fromString('invalid')).toThrow()
    expect(() => TimeZoneOffsets.fromString('+25:00')).toThrow()
    expect(() => TimeZoneOffsets.fromString('+05:60')).toThrow()
  })

  test('should return correct values for valid inputs', () => {
    expect(TimeZoneOffsets.fromString('Z')).toBe(0)
    expect(TimeZoneOffsets.fromString('+5')).toBe(TimeZoneOffsets.fromDuration({ hours: 5 }))
    expect(TimeZoneOffsets.fromString('-08:30')).toBe(TimeZoneOffsets.fromDuration({ hours: -8, minutes: -30 }))
  })
})

describe('TimeZoneOffsets.fromTimeZone', () => {
  test('should return zero offset for UTC', () => {
    const instant = Instants.fromString('2024-07-15T12:00:00Z')
    const offset = TimeZoneOffsets.fromTimeZone(TimeZoneIds.Utc, instant)
    expect(offset).toBe(0)
  })

  test('should return correct offset for America/New_York in summer (EDT)', () => {
    const instant = Instants.fromString('2024-07-15T12:00:00Z') // Summer time
    const offset = TimeZoneOffsets.fromTimeZone(TimeZoneIds.fromString('America/New_York'), instant)
    console.log('TimeZoneOffsets.fromDuration(Durations.fromHours(-4))', TimeZoneOffsets.fromDuration(Durations.fromHours(-4)))
    expect(offset).toBe(TimeZoneOffsets.fromDuration({ hours: -4 })) // EDT is UTC-4
  })

  test('should return correct offset for America/New_York in winter (EST)', () => {
    const instant = Instants.fromString('2024-01-15T12:00:00Z') // Winter time
    const offset = TimeZoneOffsets.fromTimeZone(TimeZoneIds.fromString('America/New_York'), instant)
    expect(offset).toBe(TimeZoneOffsets.fromDuration({ hours: -5 })) // EST is UTC-5
  })

  test('should return correct offset for Europe/London in summer (BST)', () => {
    const instant = Instants.fromString('2024-07-15T12:00:00Z') // Summer time
    const offset = TimeZoneOffsets.fromTimeZone(TimeZoneIds.fromString('Europe/London'), instant)
    expect(offset).toBe(TimeZoneOffsets.fromDuration({ hours: 1 })) // BST is UTC+1
  })

  test('should return correct offset for Europe/London in winter (GMT)', () => {
    const instant = Instants.fromString('2024-01-15T12:00:00Z') // Winter time
    const offset = TimeZoneOffsets.fromTimeZone(TimeZoneIds.fromString('Europe/London'), instant)
    expect(offset).toBe(0) // GMT is UTC+0
  })

  test('should return correct offset for Asia/Tokyo', () => {
    const instant = Instants.fromString('2024-07-15T12:00:00Z')
    const offset = TimeZoneOffsets.fromTimeZone(TimeZoneIds.fromString('Asia/Tokyo'), instant)
    expect(offset).toBe(TimeZoneOffsets.fromDuration({ hours: 9 })) // JST is always UTC+9
  })

  test('should return correct offset for Australia/Sydney in summer (AEDT)', () => {
    const instant = Instants.fromString('2024-01-15T12:00:00Z') // Summer time in southern hemisphere
    const offset = TimeZoneOffsets.fromTimeZone(TimeZoneIds.fromString('Australia/Sydney'), instant)
    expect(offset).toBe(TimeZoneOffsets.fromDuration({ hours: 11 })) // AEDT is UTC+11
  })

  test('should return correct offset for Australia/Sydney in winter (AEST)', () => {
    const instant = Instants.fromString('2024-07-15T12:00:00Z') // Winter time in southern hemisphere
    const offset = TimeZoneOffsets.fromTimeZone(TimeZoneIds.fromString('Australia/Sydney'), instant)
    expect(offset).toBe(TimeZoneOffsets.fromDuration({ hours: 10 })) // AEST is UTC+10
  })

  test('should return correct offset for Asia/Kolkata (half-hour offset)', () => {
    const instant = Instants.fromString('2024-07-15T12:00:00Z')
    const offset = TimeZoneOffsets.fromTimeZone(TimeZoneIds.fromString('Asia/Kolkata'), instant)
    expect(offset).toBe(TimeZoneOffsets.fromDuration({ hours: 5, minutes: 30 })) // IST is UTC+5:30
  })

  test('should return correct offset for America/Los_Angeles in summer (PDT)', () => {
    const instant = Instants.fromString('2024-07-15T12:00:00Z') // Summer time
    const offset = TimeZoneOffsets.fromTimeZone(TimeZoneIds.fromString('America/Los_Angeles'), instant)
    expect(offset).toBe(TimeZoneOffsets.fromDuration({ hours: -7 })) // PDT is UTC-7
  })

  test('should return correct offset for America/Los_Angeles in winter (PST)', () => {
    const instant = Instants.fromString('2024-01-15T12:00:00Z') // Winter time
    const offset = TimeZoneOffsets.fromTimeZone(TimeZoneIds.fromString('America/Los_Angeles'), instant)
    expect(offset).toBe(TimeZoneOffsets.fromDuration({ hours: -8 })) // PST is UTC-8
  })

  test('should handle DST transition dates correctly', () => {
    // Test a few hours before and after DST transition in 2024
    // Spring forward in US: March 10, 2024, 2:00 AM -> 3:00 AM
    const beforeSpringTransition = Instants.fromString('2024-03-10T06:00:00Z') // 1:00 AM EST
    const afterSpringTransition = Instants.fromString('2024-03-10T08:00:00Z') // 4:00 AM EDT (3:00 AM doesn't exist)

    const offsetBefore = TimeZoneOffsets.fromTimeZone(TimeZoneIds.fromString('America/New_York'), beforeSpringTransition)
    const offsetAfter = TimeZoneOffsets.fromTimeZone(TimeZoneIds.fromString('America/New_York'), afterSpringTransition)

    expect(offsetBefore).toBe(TimeZoneOffsets.fromDuration({ hours: -5 })) // EST
    expect(offsetAfter).toBe(TimeZoneOffsets.fromDuration({ hours: -4 })) // EDT
  })

  test('should handle fall back DST transition correctly', () => {
    // Fall back in US: November 3, 2024, 2:00 AM -> 1:00 AM
    const beforeFallTransition = Instants.fromString('2024-11-03T05:00:00Z') // 1:00 AM EDT
    const afterFallTransition = Instants.fromString('2024-11-03T07:00:00Z') // 2:00 AM EST

    const offsetBefore = TimeZoneOffsets.fromTimeZone(TimeZoneIds.fromString('America/New_York'), beforeFallTransition)
    const offsetAfter = TimeZoneOffsets.fromTimeZone(TimeZoneIds.fromString('America/New_York'), afterFallTransition)

    expect(offsetBefore).toBe(TimeZoneOffsets.fromDuration({ hours: -4 })) // EDT
    expect(offsetAfter).toBe(TimeZoneOffsets.fromDuration({ hours: -5 })) // EST
  })

  test('should work with different instant values on same timezone', () => {
    const timeZone = TimeZoneIds.fromString('Europe/Paris')
    const instant1 = Instants.fromString('2024-01-01T00:00:00Z')
    const instant2 = Instants.fromString('2024-06-01T00:00:00Z')
    const instant3 = Instants.fromString('2024-12-31T23:59:59Z')

    const offset1 = TimeZoneOffsets.fromTimeZone(timeZone, instant1)
    const offset2 = TimeZoneOffsets.fromTimeZone(timeZone, instant2)
    const offset3 = TimeZoneOffsets.fromTimeZone(timeZone, instant3)

    expect(offset1).toBe(TimeZoneOffsets.fromDuration({ hours: 1 })) // CET (winter)
    expect(offset2).toBe(TimeZoneOffsets.fromDuration({ hours: 2 })) // CEST (summer)
    expect(offset3).toBe(TimeZoneOffsets.fromDuration({ hours: 1 })) // CET (winter)
  })

  test('should handle extreme positive offset timezone', () => {
    const instant = Instants.fromString('2024-07-15T12:00:00Z')
    const offset = TimeZoneOffsets.fromTimeZone(TimeZoneIds.fromString('Pacific/Kiritimati'), instant)
    expect(offset).toBe(TimeZoneOffsets.fromDuration({ hours: 14 })) // UTC+14
  })

  test('should handle extreme negative offset timezone', () => {
    const instant = Instants.fromString('2024-07-15T12:00:00Z')
    const offset = TimeZoneOffsets.fromTimeZone(TimeZoneIds.fromString('Pacific/Marquesas'), instant)
    expect(offset).toBe(TimeZoneOffsets.fromDuration({ hours: -9, minutes: -30 })) // UTC-9:30
  })

  test('should handle millisecond precision instants', () => {
    const instant1 = Instants.fromString('2024-07-15T12:00:00.000Z')
    const instant2 = Instants.fromString('2024-07-15T12:10:10.999Z')

    const offset1 = TimeZoneOffsets.fromTimeZone(TimeZoneIds.fromString('America/New_York'), instant1)
    const offset2 = TimeZoneOffsets.fromTimeZone(TimeZoneIds.fromString('America/New_York'), instant2)

    // Offsets should be the same since they're within the same minute
    expect(offset1).toBe(offset2)
    expect(offset1).toBe(TimeZoneOffsets.fromDuration({ hours: -4 })) // EDT
  })
})
