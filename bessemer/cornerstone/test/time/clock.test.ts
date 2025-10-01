import { Clocks, Durations, TimeZoneIds } from '@bessemer/cornerstone'

describe('Clocks.system', () => {
  test('should create system clock with UTC by default', () => {
    const clock = Clocks.system()
    expect(clock.zone).toBe(TimeZoneIds.Utc)
  })

  test('should create system clock with specified zone', () => {
    const clock = Clocks.system(TimeZoneIds.fromString('America/New_York'))
    expect(clock.zone).toBe('America/New_York')
  })

  test('should return current time', () => {
    const clock = Clocks.system()
    const before = new Date()
    const instant = clock.instant()
    const after = new Date()

    expect(instant.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(instant.getTime()).toBeLessThanOrEqual(after.getTime())
  })
})

describe('FixedClock', () => {
  const fixedDate = new Date('2023-10-15T10:30:00Z')

  test('should create fixed clock with UTC by default', () => {
    const clock = Clocks.fixed(fixedDate)
    expect(clock.zone).toBe(TimeZoneIds.Utc)
  })

  test('should create fixed clock with specified zone', () => {
    const clock = Clocks.fixed(fixedDate, TimeZoneIds.fromString('Europe/London'))
    expect(clock.zone).toBe('Europe/London')
  })

  test('should always return the fixed instant', () => {
    const clock = Clocks.fixed(fixedDate)
    expect(clock.instant()).toEqual(fixedDate)
    expect(clock.instant()).toEqual(fixedDate)
    expect(clock.instant()).toEqual(fixedDate)
  })
})

describe('OffsetClock', () => {
  const baseDate = new Date('2023-10-15T10:30:00Z')
  const baseClock = Clocks.fixed(baseDate)

  test('should return original clock when offset is zero', () => {
    const offsetClock = Clocks.offset(baseClock, Durations.Zero)
    expect(offsetClock).toBe(baseClock)
  })

  test('should apply positive offset correctly', () => {
    const offsetClock = Clocks.offset(baseClock, Durations.fromHours(2))
    const expectedDate = new Date(baseDate.getTime() + Durations.fromHours(2))
    expect(offsetClock.instant()).toEqual(expectedDate)
  })

  test('should apply negative offset correctly', () => {
    const offsetClock = Clocks.offset(baseClock, Durations.fromHours(-3))
    const expectedDate = new Date(baseDate.getTime() - Durations.fromHours(3))
    expect(offsetClock.instant()).toEqual(expectedDate)
  })

  test('should apply minute-level offset correctly', () => {
    const offsetClock = Clocks.offset(baseClock, Durations.fromMinutes(45))
    const expectedDate = new Date(baseDate.getTime() + Durations.fromMinutes(45))
    expect(offsetClock.instant()).toEqual(expectedDate)
  })

  test('should inherit zone from base clock', () => {
    const baseClockWithZone = Clocks.fixed(baseDate, TimeZoneIds.fromString('America/Chicago'))
    const offsetClock = Clocks.offset(baseClockWithZone, Durations.fromHours(1))
    expect(offsetClock.zone).toBe('America/Chicago')
  })

  test('should return same instance when withZone called with same zone', () => {
    const offsetClock = Clocks.offset(baseClock, Durations.fromHours(1))
    const sameClock = offsetClock.withZone(TimeZoneIds.Utc)
    expect(sameClock).toBe(offsetClock)
  })

  test('should return new offset clock when withZone called with different zone', () => {
    const offsetClock = Clocks.offset(baseClock, Durations.fromHours(1))
    const newClock = offsetClock.withZone(TimeZoneIds.fromString('Europe/Paris'))
    expect(newClock).not.toBe(offsetClock)
    expect(newClock.zone).toBe('Europe/Paris')

    // Should still apply the same offset
    const expectedDate = new Date(baseDate.getTime() + Durations.fromHours(1))
    expect(newClock.instant()).toEqual(expectedDate)
  })

  test('should work with system clock as base', () => {
    const systemClock = Clocks.system()
    const offsetClock = Clocks.offset(systemClock, Durations.fromHours(1))

    const before = new Date().getTime() + Durations.fromHours(1) - 100 // Allow 100ms tolerance
    const instant = offsetClock.instant()
    const after = new Date().getTime() + Durations.fromHours(1) + 100 // Allow 100ms tolerance

    expect(instant.getTime()).toBeGreaterThanOrEqual(before)
    expect(instant.getTime()).toBeLessThanOrEqual(after)
  })
})
