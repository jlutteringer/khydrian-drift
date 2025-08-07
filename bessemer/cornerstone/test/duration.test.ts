import { Durations } from '@bessemer/cornerstone'

test('Durations.fromMilliseconds / Durations.toMilliseconds', () => {
  const d = Durations.fromMilliseconds(500)
  expect(Durations.toMilliseconds(d)).toBe(500)

  const zero = Durations.fromMilliseconds(0)
  expect(Durations.toMilliseconds(zero)).toBe(0)
})

test('Durations.fromSeconds / Durations.toSeconds', () => {
  const d = Durations.fromSeconds(2)
  expect(Durations.toMilliseconds(d)).toBe(2000)
  expect(Durations.toSeconds(d)).toBe(2)

  const fractional = Durations.fromSeconds(1.5)
  expect(Durations.toMilliseconds(fractional)).toBe(1500)
  expect(Durations.toSeconds(fractional)).toBeCloseTo(1.5)
})

test('Durations.fromMinutes / Durations.toMinutes', () => {
  const d = Durations.fromMinutes(3)
  expect(Durations.toMilliseconds(d)).toBe(180_000)
  expect(Durations.toMinutes(d)).toBe(3)

  const fractional = Durations.fromMinutes(0.25)
  expect(Durations.toMilliseconds(fractional)).toBe(15_000)
  expect(Durations.toMinutes(fractional)).toBeCloseTo(0.25)
})

test('Durations.fromHours / Durations.toHours', () => {
  const d = Durations.fromHours(1)
  expect(Durations.toMilliseconds(d)).toBe(3_600_000)
  expect(Durations.toHours(d)).toBe(1)

  const fractional = Durations.fromHours(1.5)
  expect(Durations.toMilliseconds(fractional)).toBe(5_400_000)
  expect(Durations.toHours(fractional)).toBeCloseTo(1.5)
})

test('Durations.fromDays / Durations.toDays', () => {
  const d = Durations.fromDays(2)
  expect(Durations.toMilliseconds(d)).toBe(172_800_000)
  expect(Durations.toDays(d)).toBe(2)

  const fractional = Durations.fromDays(0.5)
  expect(Durations.toMilliseconds(fractional)).toBe(43_200_000)
  expect(Durations.toDays(fractional)).toBeCloseTo(0.5)
})

test('Durations.Zero', () => {
  expect(Durations.toMilliseconds(Durations.Zero)).toBe(0)
  expect(Durations.toSeconds(Durations.Zero)).toBe(0)
})

test('Durations.OneHour', () => {
  expect(Durations.toMilliseconds(Durations.OneHour)).toBe(3_600_000)
  expect(Durations.toMinutes(Durations.OneHour)).toBe(60)
})

test('Durations.OneDay', () => {
  expect(Durations.toMilliseconds(Durations.OneDay)).toBe(86_400_000)
  expect(Durations.toHours(Durations.OneDay)).toBe(24)
})

test('Durations.DurationSchema', () => {
  // Should accept valid number
  expect(Durations.Schema.parse(1234)).toBe(1234)

  // Should reject invalid values
  expect(() => Durations.Schema.parse('5000')).toThrow()
  expect(() => Durations.Schema.parse(null)).toThrow()
  expect(() => Durations.Schema.parse(undefined)).toThrow()
})
