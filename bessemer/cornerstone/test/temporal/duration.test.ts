import { Durations } from '@bessemer/cornerstone'
import { Temporal } from '@js-temporal/polyfill'
import { TimeUnit } from '@bessemer/cornerstone/temporal/chrono'

describe('Durations.from', () => {
  test('should return Duration instance as-is', () => {
    const duration = Temporal.Duration.from({ hours: 2 })
    const result = Durations.from(duration)
    expect(result).toBe(duration)
  })

  test('should create Duration from builder object', () => {
    const result = Durations.from({ hours: 1, minutes: 30, seconds: 45 })
    expect(result.hours).toBe(1)
    expect(result.minutes).toBe(30)
    expect(result.seconds).toBe(45)
  })
})

describe('Durations.parseString', () => {
  test('should parse valid ISO 8601 duration string', () => {
    const result = Durations.parseString('PT2H30M45S')

    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value.hours).toBe(2)
      expect(result.value.minutes).toBe(30)
      expect(result.value.seconds).toBe(45)
    }
  })

  test('should parse duration with milliseconds', () => {
    const result = Durations.parseString('PT1H30M45.123S')

    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value.hours).toBe(1)
      expect(result.value.minutes).toBe(30)
      expect(result.value.seconds).toBe(45)
      expect(result.value.milliseconds).toBe(123)
    }
  })

  test('should parse zero duration', () => {
    const result = Durations.parseString('PT0S')

    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value.seconds).toBe(0)
    }
  })

  test('should fail on invalid duration string', () => {
    const result = Durations.parseString('invalid-duration')
    expect(result.isSuccess).toBe(false)
  })

  test('should fail on empty string', () => {
    const result = Durations.parseString('')
    expect(result.isSuccess).toBe(false)
  })
})

describe('Durations.fromString', () => {
  test('should parse valid duration string', () => {
    const result = Durations.fromString('PT2H30M')
    expect(result.hours).toBe(2)
    expect(result.minutes).toBe(30)
  })

  test('should throw on invalid string', () => {
    expect(() => Durations.fromString('invalid-duration')).toThrow()
  })
})

describe('Durations.toLiteral', () => {
  test('should convert duration to string literal', () => {
    const duration = Durations.from({ hours: 2, minutes: 30, seconds: 45 })
    const result = Durations.toLiteral(duration)
    expect(result).toBe('PT2H30M45S')
  })

  test('should handle zero duration', () => {
    const result = Durations.toLiteral(Durations.Zero)
    expect(result).toBe('PT0S')
  })

  test('should handle complex duration with milliseconds', () => {
    const duration = Durations.from({ hours: 1, minutes: 15, seconds: 30, milliseconds: 500 })
    const result = Durations.toLiteral(duration)
    expect(result).toBe('PT1H15M30.5S')
  })
})

describe('Durations.isDuration', () => {
  test('should return true for Duration instance', () => {
    const duration = Durations.from({ hours: 1 })
    expect(Durations.isDuration(duration)).toBe(true)
  })

  test('should return false for non-Duration values', () => {
    expect(Durations.isDuration('PT1H')).toBe(false)
    expect(Durations.isDuration({ hours: 1 })).toBe(false)
    expect(Durations.isDuration(null)).toBe(false)
    expect(Durations.isDuration(undefined)).toBe(false)
    expect(Durations.isDuration(123)).toBe(false)
  })
})

describe('Durations.merge', () => {
  test('should merge duration with builder', () => {
    const base = Durations.from({ hours: 1, minutes: 30 })
    const result = Durations.merge(base, { minutes: 45, seconds: 30 })

    expect(result.hours).toBe(1)
    expect(result.minutes).toBe(45)
    expect(result.seconds).toBe(30)
  })
})

describe('Durations.fromMilliseconds', () => {
  test('should create duration from milliseconds', () => {
    const result = Durations.fromMilliseconds(1500)
    expect(result.milliseconds).toBe(1500)
  })

  test('should handle zero milliseconds', () => {
    const result = Durations.fromMilliseconds(0)
    expect(result.milliseconds).toBe(0)
  })
})

describe('Durations.toMilliseconds', () => {
  test('should convert duration to milliseconds', () => {
    const duration = Durations.from({ seconds: 1, milliseconds: 500 })
    const result = Durations.toMilliseconds(duration)
    expect(result).toBe(1500)
  })

  test('should handle complex duration', () => {
    const duration = Durations.from({ hours: 1, minutes: 30, seconds: 45 })
    const result = Durations.toMilliseconds(duration)
    expect(result).toBe(5445000) // 1*3600 + 30*60 + 45 = 5445 seconds = 5445000 ms
  })
})

describe('Durations.fromSeconds', () => {
  test('should create duration from seconds', () => {
    const result = Durations.fromSeconds(90)
    expect(result.seconds).toBe(90)
  })
})

describe('Durations.toSeconds', () => {
  test('should convert duration to seconds', () => {
    const duration = Durations.from({ minutes: 2, seconds: 30 })
    const result = Durations.toSeconds(duration)
    expect(result).toBe(150)
  })
})

describe('Durations.fromMinutes', () => {
  test('should create duration from minutes', () => {
    const result = Durations.fromMinutes(45)
    expect(result.minutes).toBe(45)
  })
})

describe('Durations.toMinutes', () => {
  test('should convert duration to minutes', () => {
    const duration = Durations.from({ hours: 1, minutes: 30 })
    const result = Durations.toMinutes(duration)
    expect(result).toBe(90)
  })
})

describe('Durations.fromHours', () => {
  test('should create duration from hours', () => {
    const result = Durations.fromHours(2)
    expect(result.hours).toBe(2)
  })
})

describe('Durations.toHours', () => {
  test('should convert duration to hours', () => {
    const duration = Durations.from({ hours: 2, minutes: 30 })
    const result = Durations.toHours(duration)
    expect(result).toBe(2.5)
  })
})

describe('Durations.fromUnit', () => {
  test('should create duration from nanoseconds', () => {
    const result = Durations.fromUnit(500, TimeUnit.Nanosecond)
    expect(result.nanoseconds).toBe(500)
  })

  test('should create duration from microseconds', () => {
    const result = Durations.fromUnit(750, TimeUnit.Microsecond)
    expect(result.microseconds).toBe(750)
  })

  test('should create duration from milliseconds', () => {
    const result = Durations.fromUnit(1500, TimeUnit.Millisecond)
    expect(result.milliseconds).toBe(1500)
  })

  test('should create duration from seconds', () => {
    const result = Durations.fromUnit(45, TimeUnit.Second)
    expect(result.seconds).toBe(45)
  })

  test('should create duration from minutes', () => {
    const result = Durations.fromUnit(30, TimeUnit.Minute)
    expect(result.minutes).toBe(30)
  })

  test('should create duration from hours', () => {
    const result = Durations.fromUnit(2, TimeUnit.Hour)
    expect(result.hours).toBe(2)
  })
})

describe('Durations.toUnit', () => {
  test('should convert to nanoseconds', () => {
    const duration = Durations.from({ microseconds: 1 })
    const result = Durations.toUnit(duration, TimeUnit.Nanosecond)
    expect(result).toBe(1000)
  })

  test('should convert to milliseconds', () => {
    const duration = Durations.from({ seconds: 2 })
    const result = Durations.toUnit(duration, TimeUnit.Millisecond)
    expect(result).toBe(2000)
  })

  test('should convert to hours', () => {
    const duration = Durations.from({ minutes: 120 })
    const result = Durations.toUnit(duration, TimeUnit.Hour)
    expect(result).toBe(2)
  })
})

describe('Durations.isZero', () => {
  test('should return true for zero duration', () => {
    expect(Durations.isZero(Durations.Zero)).toBe(true)
  })

  test('should return true for duration created with zeros', () => {
    const duration = Durations.from({ hours: 0, minutes: 0, seconds: 0 })
    expect(Durations.isZero(duration)).toBe(true)
  })

  test('should return false for non-zero duration', () => {
    const duration = Durations.from({ milliseconds: 1 })
    expect(Durations.isZero(duration)).toBe(false)
  })
})

describe('Durations.round', () => {
  test('should round to nearest second', () => {
    const duration = Durations.from({ seconds: 30, milliseconds: 750 })
    const result = Durations.round(duration, TimeUnit.Second)
    expect(result.seconds).toBe(31)
    expect(result.milliseconds).toBe(0)
  })

  test('should round to nearest minute', () => {
    const duration = Durations.from({ minutes: 5, seconds: 45 })
    const result = Durations.round(duration, TimeUnit.Minute)
    expect(result.minutes).toBe(6)
    expect(result.seconds).toBe(0)
  })
})

describe('Durations.add', () => {
  test('should add multiple durations', () => {
    const duration1 = Durations.from({ hours: 1, minutes: 30 })
    const duration2 = Durations.from({ minutes: 45, seconds: 30 })
    const duration3 = Durations.from({ seconds: 15 })

    const result = Durations.add(duration1, duration2, duration3)
    expect(result.hours).toBe(1)
    expect(result.minutes).toBe(75)
    expect(result.seconds).toBe(45)
  })

  test('should handle empty array', () => {
    const result = Durations.add()
    expect(Durations.isZero(result)).toBe(true)
  })

  test('should handle single duration', () => {
    const duration = Durations.from({ hours: 2 })
    const result = Durations.add(duration)
    expect(result).toEqual(duration)
  })
})

describe('Durations.subtract', () => {
  test('should subtract durations', () => {
    const duration1 = Durations.from({ hours: 3, minutes: 30 })
    const duration2 = Durations.from({ hours: 1, minutes: 15 })

    const result = Durations.subtract(duration1, duration2)
    expect(result.hours).toBe(2)
    expect(result.minutes).toBe(15)
  })

  test('should handle empty array', () => {
    const result = Durations.subtract()
    expect(Durations.isZero(result)).toBe(true)
  })

  test('should handle single duration', () => {
    const duration = Durations.from({ hours: 2 })
    const result = Durations.subtract(duration)
    expect(result).toEqual(duration)
  })

  test('should subtract multiple durations from first', () => {
    const duration1 = Durations.from({ hours: 5 })
    const duration2 = Durations.from({ hours: 2 })
    const duration3 = Durations.from({ hours: 1 })

    const result = Durations.subtract(duration1, duration2, duration3)
    expect(result.hours).toBe(2)
  })
})

describe('Durations.negate', () => {
  test('should negate positive duration', () => {
    const duration = Durations.from({ hours: 2, minutes: 30 })
    const result = Durations.negate(duration)
    expect(result.hours).toBe(-2)
    expect(result.minutes).toBe(-30)
  })

  test('should negate negative duration', () => {
    const duration = Durations.from({ hours: -1, minutes: -15 })
    const result = Durations.negate(duration)
    expect(result.hours).toBe(1)
    expect(result.minutes).toBe(15)
  })

  test('should handle zero duration', () => {
    const result = Durations.negate(Durations.Zero)
    expect(Durations.isZero(result)).toBe(true)
  })
})

describe('Durations.isEqual', () => {
  test('should return true for equal durations', () => {
    const duration1 = Durations.from({ hours: 1, minutes: 30 })
    const duration2 = Durations.from({ hours: 1, minutes: 30 })
    expect(Durations.isEqual(duration1, duration2)).toBe(true)
  })

  test('should return false for different durations', () => {
    const duration1 = Durations.from({ hours: 1, minutes: 30 })
    const duration2 = Durations.from({ hours: 1, minutes: 45 })
    expect(Durations.isEqual(duration1, duration2)).toBe(false)
  })

  test('should handle equivalent durations with different units', () => {
    const duration1 = Durations.from({ minutes: 90 })
    const duration2 = Durations.from({ hours: 1, minutes: 30 })
    expect(Durations.isEqual(duration1, duration2)).toBe(true)
  })
})

describe('Durations.isLess', () => {
  test('should return true when first duration is less', () => {
    const duration1 = Durations.from({ hours: 1 })
    const duration2 = Durations.from({ hours: 2 })
    expect(Durations.isLess(duration1, duration2)).toBe(true)
  })

  test('should return false when first duration is greater', () => {
    const duration1 = Durations.from({ hours: 2 })
    const duration2 = Durations.from({ hours: 1 })
    expect(Durations.isLess(duration1, duration2)).toBe(false)
  })

  test('should return false when durations are equal', () => {
    const duration1 = Durations.from({ hours: 1 })
    const duration2 = Durations.from({ hours: 1 })
    expect(Durations.isLess(duration1, duration2)).toBe(false)
  })
})

describe('Durations.isGreater', () => {
  test('should return true when first duration is greater', () => {
    const duration1 = Durations.from({ hours: 2 })
    const duration2 = Durations.from({ hours: 1 })
    expect(Durations.isGreater(duration1, duration2)).toBe(true)
  })

  test('should return false when first duration is less', () => {
    const duration1 = Durations.from({ hours: 1 })
    const duration2 = Durations.from({ hours: 2 })
    expect(Durations.isGreater(duration1, duration2)).toBe(false)
  })

  test('should return false when durations are equal', () => {
    const duration1 = Durations.from({ hours: 1 })
    const duration2 = Durations.from({ hours: 1 })
    expect(Durations.isGreater(duration1, duration2)).toBe(false)
  })
})

describe('Durations.CompareBy', () => {
  test('should return negative number when first is less', () => {
    const duration1 = Durations.from({ hours: 1 })
    const duration2 = Durations.from({ hours: 2 })
    expect(Durations.CompareBy(duration1, duration2)).toBeLessThan(0)
  })

  test('should return positive number when first is greater', () => {
    const duration1 = Durations.from({ hours: 2 })
    const duration2 = Durations.from({ hours: 1 })
    expect(Durations.CompareBy(duration1, duration2)).toBeGreaterThan(0)
  })

  test('should return zero when durations are equal', () => {
    const duration1 = Durations.from({ hours: 1 })
    const duration2 = Durations.from({ hours: 1 })
    expect(Durations.CompareBy(duration1, duration2)).toBe(0)
  })
})

describe('Durations.EqualBy', () => {
  test('should return true for equal durations', () => {
    const duration1 = Durations.from({ hours: 1, minutes: 30 })
    const duration2 = Durations.from({ hours: 1, minutes: 30 })
    expect(Durations.EqualBy(duration1, duration2)).toBe(true)
  })

  test('should return false for different durations', () => {
    const duration1 = Durations.from({ hours: 1 })
    const duration2 = Durations.from({ hours: 2 })
    expect(Durations.EqualBy(duration1, duration2)).toBe(false)
  })
})
