import { Clocks, Durations, Instants, TimeZoneIds } from '@bessemer/cornerstone'

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
    const before = Instants.now()
    const instant = clock.instant()
    const after = Instants.now()

    expect(Instants.isAfter(instant, before) || Instants.isEqual(instant, before)).toBe(true)
    expect(Instants.isBefore(instant, after) || Instants.isEqual(instant, after)).toBe(true)
  })
})

describe('FixedClock', () => {
  const fixedInstant = Instants.fromString('2023-10-15T10:30:00Z')

  test('should create fixed clock with UTC by default', () => {
    const clock = Clocks.fixed(fixedInstant)
    expect(clock.zone).toBe(TimeZoneIds.Utc)
  })

  test('should create fixed clock with specified zone', () => {
    const clock = Clocks.fixed(fixedInstant, TimeZoneIds.fromString('Europe/London'))
    expect(clock.zone).toBe('Europe/London')
  })

  test('should always return the fixed instant', () => {
    const clock = Clocks.fixed(fixedInstant)
    expect(clock.instant()).toEqual(fixedInstant)
    expect(clock.instant()).toEqual(fixedInstant)
    expect(clock.instant()).toEqual(fixedInstant)
  })
})

describe('OffsetClock', () => {
  const baseInstant = Instants.fromString('2023-10-15T10:30:00Z')
  const baseClock = Clocks.fixed(baseInstant)

  test('should return original clock when offset is zero', () => {
    const offsetClock = Clocks.offset(baseClock, Durations.Zero)
    expect(offsetClock).toBe(baseClock)
  })

  test('should apply positive offset correctly', () => {
    const offsetClock = Clocks.offset(baseClock, Durations.fromHours(2))
    const expectedDate = baseInstant.add(Durations.fromHours(2))
    expect(offsetClock.instant()).toEqual(expectedDate)
  })

  test('should apply negative offset correctly', () => {
    const offsetClock = Clocks.offset(baseClock, Durations.fromHours(-3))
    const expectedDate = baseInstant.subtract(Durations.fromHours(-3))
    expect(offsetClock.instant()).toEqual(expectedDate)
  })

  test('should apply minute-level offset correctly', () => {
    const offsetClock = Clocks.offset(baseClock, Durations.fromMinutes(45))
    const expectedDate = baseInstant.add(Durations.fromMinutes(45))
    expect(offsetClock.instant()).toEqual(expectedDate)
  })

  test('should inherit zone from base clock', () => {
    const baseClockWithZone = Clocks.fixed(baseInstant, TimeZoneIds.fromString('America/Chicago'))
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
    const expectedDate = baseInstant.add(Durations.fromHours(1))
    expect(newClock.instant()).toEqual(expectedDate)
  })

  test('should work with system clock as base', () => {
    const systemClock = Clocks.system()
    const offsetClock = Clocks.offset(systemClock, Durations.fromHours(1))

    const before = Instants.now().add(Durations.fromHours(1)).subtract(Durations.fromMilliseconds(100))
    const instant = offsetClock.instant()
    const after = Instants.now().add(Durations.fromHours(1)).add(Durations.fromMilliseconds(100))

    expect(Instants.isAfter(instant, before) || Instants.isEqual(instant, before)).toBe(true)
    expect(Instants.isBefore(instant, after) || Instants.isEqual(instant, after)).toBe(true)
  })
})
