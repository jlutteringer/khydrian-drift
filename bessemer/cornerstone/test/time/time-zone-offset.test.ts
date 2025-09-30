import { Durations, TimeZoneOffsets } from '@bessemer/cornerstone'

describe('TimeZoneOffset.fromMilliseconds', () => {
  test('should create TimeZoneOffset for valid values', () => {
    expect(TimeZoneOffsets.fromMilliseconds(0)).toBe(0)
    expect(TimeZoneOffsets.fromMilliseconds(Durations.fromHours(5))).toBe(Durations.fromHours(5))
    expect(TimeZoneOffsets.fromMilliseconds(-Durations.fromHours(8))).toBe(-Durations.fromHours(8))
  })

  test('should accept maximum positive offset (+18:00)', () => {
    const eighteenHours = Durations.fromHours(18)
    expect(TimeZoneOffsets.fromMilliseconds(eighteenHours)).toBe(eighteenHours)
  })

  test('should accept maximum negative offset (-18:00)', () => {
    const minusEighteenHours = -Durations.fromHours(18)
    expect(TimeZoneOffsets.fromMilliseconds(minusEighteenHours)).toBe(minusEighteenHours)
  })

  test('should throw for values exceeding +18:00', () => {
    const overEighteenHours = Durations.fromHours(18) + 1
    expect(() => TimeZoneOffsets.fromMilliseconds(overEighteenHours)).toThrow()
  })

  test('should throw for values below -18:00', () => {
    const underMinusEighteenHours = -Durations.fromHours(18) - 1
    expect(() => TimeZoneOffsets.fromMilliseconds(underMinusEighteenHours)).toThrow()
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
      expect(result.value).toBe(Durations.fromHours(5))
    }
  })

  test('should parse -h format', () => {
    const result = TimeZoneOffsets.parseString('-3')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe(-Durations.fromHours(3))
    }
  })

  test('should parse +hh format', () => {
    const result = TimeZoneOffsets.parseString('+05')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe(Durations.fromHours(5))
    }
  })

  test('should parse -hh format', () => {
    const result = TimeZoneOffsets.parseString('-08')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe(-Durations.fromHours(8))
    }
  })

  test('should parse +hh:mm format', () => {
    const result = TimeZoneOffsets.parseString('+05:30')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe(Durations.fromHours(5) + Durations.fromMinutes(30))
    }
  })

  test('should parse -hh:mm format', () => {
    const result = TimeZoneOffsets.parseString('-08:45')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe(-(Durations.fromHours(8) + Durations.fromMinutes(45)))
    }
  })

  test('should parse +hhmm format', () => {
    const result = TimeZoneOffsets.parseString('+0530')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe(Durations.fromHours(5) + Durations.fromMinutes(30))
    }
  })

  test('should parse -hhmm format', () => {
    const result = TimeZoneOffsets.parseString('-0845')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe(-(Durations.fromHours(8) + Durations.fromMinutes(45)))
    }
  })

  test('should parse +hh:mm:ss format', () => {
    const result = TimeZoneOffsets.parseString('+05:30:15')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe(Durations.fromHours(5) + Durations.fromMinutes(30) + Durations.fromSeconds(15))
    }
  })

  test('should parse -hh:mm:ss format', () => {
    const result = TimeZoneOffsets.parseString('-08:45:30')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe(-(Durations.fromHours(8) + Durations.fromMinutes(45) + Durations.fromSeconds(30)))
    }
  })

  test('should parse +hhmmss format', () => {
    const result = TimeZoneOffsets.parseString('+053015')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe(Durations.fromHours(5) + Durations.fromMinutes(30) + Durations.fromSeconds(15))
    }
  })

  test('should parse -hhmmss format', () => {
    const result = TimeZoneOffsets.parseString('-084530')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe(-(Durations.fromHours(8) + Durations.fromMinutes(45) + Durations.fromSeconds(30)))
    }
  })

  test('should parse maximum positive offset (+18:00)', () => {
    const result = TimeZoneOffsets.parseString('+18:00')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe(Durations.fromHours(18))
    }
  })

  test('should parse maximum negative offset (-18:00)', () => {
    const result = TimeZoneOffsets.parseString('-18:00')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe(-Durations.fromHours(18))
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
      { input: '+05:30', expected: Durations.fromHours(5) + Durations.fromMinutes(30) }, // IST
      { input: '+09:00', expected: Durations.fromHours(9) }, // JST/KST
      { input: '+12:00', expected: Durations.fromHours(12) }, // NZST
    ]

    testCases.forEach(({ input, expected }) => {
      const result = TimeZoneOffsets.parseString(input)
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value).toBe(expected)
      }
    })
  })

  test('should handle common negative offsets', () => {
    const testCases = [
      { input: '-05:00', expected: -Durations.fromHours(5) }, // EST
      { input: '-08:00', expected: -Durations.fromHours(8) }, // PST
      { input: '-10:00', expected: -Durations.fromHours(10) }, // HST
    ]

    testCases.forEach(({ input, expected }) => {
      const result = TimeZoneOffsets.parseString(input)
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value).toBe(expected)
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
    expect(TimeZoneOffsets.fromString('+5')).toBe(Durations.fromHours(5))
    expect(TimeZoneOffsets.fromString('-08:30')).toBe(-(Durations.fromHours(8) + Durations.fromMinutes(30)))
  })
})
