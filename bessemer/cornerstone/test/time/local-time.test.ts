import { Durations, LocalTimes, TimeZoneIds } from '@bessemer/cornerstone'
import { LocalTimeInstance } from '@bessemer/cornerstone/time/LocalTimeInstance'

describe('LocalTimes.fromProps', () => {
  test('should format time with hours and minutes only when seconds and milliseconds are zero', () => {
    const result = LocalTimes.fromProps({ hour: 9, minute: 30, second: 0, millisecond: 0 })
    expect(result).toBe('09:30:00')
  })

  test('should format time with seconds when seconds > 0 but milliseconds are zero', () => {
    const result = LocalTimes.fromProps({ hour: 14, minute: 45, second: 30, millisecond: 0 })
    expect(result).toBe('14:45:30')
  })

  test('should format time with milliseconds when milliseconds > 0', () => {
    const result = LocalTimes.fromProps({ hour: 23, minute: 59, second: 45, millisecond: 123 })
    expect(result).toBe('23:59:45.123')
  })

  test('should pad single digit hours with leading zero', () => {
    const result = LocalTimes.fromProps({ hour: 5, minute: 30, second: 0, millisecond: 0 })
    expect(result).toBe('05:30:00')
  })

  test('should pad single digit minutes with leading zero', () => {
    const result = LocalTimes.fromProps({ hour: 12, minute: 5, second: 0, millisecond: 0 })
    expect(result).toBe('12:05:00')
  })

  test('should pad single digit seconds with leading zero', () => {
    const result = LocalTimes.fromProps({ hour: 12, minute: 30, second: 5, millisecond: 0 })
    expect(result).toBe('12:30:05')
  })

  test('should pad milliseconds to 3 digits', () => {
    expect(LocalTimes.fromProps({ hour: 12, minute: 30, second: 45, millisecond: 5 })).toBe('12:30:45.005')
    expect(LocalTimes.fromProps({ hour: 12, minute: 30, second: 45, millisecond: 50 })).toBe('12:30:45.050')
    expect(LocalTimes.fromProps({ hour: 12, minute: 30, second: 45, millisecond: 500 })).toBe('12:30:45.500')
  })

  test('should handle midnight time', () => {
    const result = LocalTimes.fromProps({ hour: 0, minute: 0, second: 0, millisecond: 0 })
    expect(result).toBe('00:00:00')
  })

  test('should handle end of day time', () => {
    const result = LocalTimes.fromProps({ hour: 23, minute: 59, second: 59, millisecond: 999 })
    expect(result).toBe('23:59:59.999')
  })

  test('should include seconds but not milliseconds when seconds > 0 and milliseconds = 0', () => {
    const result = LocalTimes.fromProps({ hour: 10, minute: 15, second: 30, millisecond: 0 })
    expect(result).toBe('10:15:30')
  })

  test('should include both seconds and milliseconds when both > 0', () => {
    const result = LocalTimes.fromProps({ hour: 16, minute: 20, second: 15, millisecond: 750 })
    expect(result).toBe('16:20:15.750')
  })
})

describe('LocalTimes.fromString', () => {
  test('should convert valid time string to LocalTime', () => {
    const result = LocalTimes.fromString('14:30:45.123')
    expect(result).toBe('14:30:45.123')
  })
})

describe('LocalTimes.asInstance', () => {
  test('should convert LocalTime string to LocalTimeInstance', () => {
    const time = LocalTimes.fromString('14:30:45.123')
    const result = LocalTimes.asInstance(time)
    expect(result).toBeInstanceOf(LocalTimeInstance)
    expect(result.hour).toBe(14)
    expect(result.minute).toBe(30)
  })
})

describe('LocalTimes.now', () => {
  test('should return current local time', () => {
    const result = LocalTimes.now()
    expect(typeof result).toBe('string')
  })
})

describe('LocalTimes.fromInstant', () => {
  test('should convert instant and timezone to LocalTime', () => {
    const instant = new Date('2024-07-15T14:30:45.123Z')
    const result = LocalTimes.fromInstant(instant, TimeZoneIds.Utc)
    expect(result).toBe('14:30:45.123')
  })
})

describe('LocalTimes.fromDuration', () => {
  test('should convert duration to LocalTime', () => {
    const duration = Durations.fromHours(2.5)
    const result = LocalTimes.fromDuration(duration)
    expect(result).toBe('02:30:00')
  })
})

describe('LocalTimes.addDuration', () => {
  test('should add duration to time', () => {
    const time = LocalTimes.fromString('10:30')
    const duration = Durations.fromHours(1)
    const result = LocalTimes.addDuration(time, duration)
    expect(result).toBe('11:30:00')
  })
})

describe('LocalTimes.subtractDuration', () => {
  test('should subtract duration from time', () => {
    const time = LocalTimes.fromString('10:30')
    const duration = Durations.fromMinutes(30)
    const result = LocalTimes.subtractDuration(time, duration)
    expect(result).toBe('10:00:00')
  })
})

describe('LocalTimes.timeBetween', () => {
  test('should calculate duration between times', () => {
    const first = LocalTimes.fromString('10:00')
    const second = LocalTimes.fromString('11:00')
    const result = LocalTimes.timeBetween(first, second)
    expect(result).toBe(Durations.fromHours(1))
  })
})

describe('LocalTimes.isBefore', () => {
  test('should return true when first time is before second', () => {
    const first = LocalTimes.fromString('10:00')
    const second = LocalTimes.fromString('11:00')
    const result = LocalTimes.isBefore(first, second)
    expect(result).toBe(true)
  })
})

describe('LocalTimes.isAfter', () => {
  test('should return true when first time is after second', () => {
    const first = LocalTimes.fromString('11:00')
    const second = LocalTimes.fromString('10:00')
    const result = LocalTimes.isAfter(first, second)
    expect(result).toBe(true)
  })
})

describe('LocalTimes.timeUntil', () => {
  test('should calculate time until other time', () => {
    const first = LocalTimes.fromString('10:00')
    const second = LocalTimes.fromString('12:00')
    const result = LocalTimes.timeUntil(first, second)
    expect(result).toBe(Durations.fromHours(2))
  })
})
