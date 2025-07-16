import { Maths } from '@bessemer/cornerstone'
import { RoundingMode } from '@bessemer/cornerstone/math'

test('Maths.isNumber', () => {
  expect(Maths.isNumber(42)).toBe(true)
  expect(Maths.isNumber(0)).toBe(true)
  expect(Maths.isNumber(-3.14)).toBe(true)

  expect(Maths.isNumber('42')).toBe(false)
  expect(Maths.isNumber(null)).toBe(false)
  expect(Maths.isNumber(undefined)).toBe(false)
  expect(Maths.isNumber(NaN)).toBe(false)
})

test('Maths.isEven', () => {
  expect(Maths.isEven(2)).toBe(true)
  expect(Maths.isEven(0)).toBe(true)
  expect(Maths.isEven(7)).toBe(false)
  expect(Maths.isEven(-4)).toBe(true)
})

test('Maths.roundNearest', () => {
  expect(Maths.roundNearest(1.2345, 2)).toBeCloseTo(1.23)
  expect(Maths.roundNearest(1.2355, 2)).toBeCloseTo(1.24)
})

test('Maths.roundDown', () => {
  expect(Maths.roundDown(1.239, 2)).toBeCloseTo(1.23)
  expect(Maths.roundDown(1.299, 1)).toBeCloseTo(1.2)
})

test('Maths.roundUp', () => {
  expect(Maths.roundUp(1.231, 2)).toBeCloseTo(1.24)
  expect(Maths.roundUp(1.201, 1)).toBeCloseTo(1.3)
})

test('Maths.roundHalfEven', () => {
  expect(Maths.roundHalfEven(2.5, 0)).toBe(2)
  expect(Maths.roundHalfEven(3.5, 0)).toBe(4)
  expect(Maths.roundHalfEven(1.225, 2)).toBeCloseTo(1.22)
  expect(Maths.roundHalfEven(1.235, 2)).toBeCloseTo(1.24)

  expect(Maths.roundHalfEven(-2.5, 0)).toBe(-2)
  expect(Maths.roundHalfEven(-3.5, 0)).toBe(-4)

  expect(() => Maths.roundHalfEven(1.234, 21)).toThrow()
})

test('Maths.round', () => {
  expect(Maths.round(1.239, 2, RoundingMode.Nearest)).toBeCloseTo(1.24)
  expect(Maths.round(1.239, 2, RoundingMode.Down)).toBeCloseTo(1.23)
  expect(Maths.round(1.239, 2, RoundingMode.Up)).toBeCloseTo(1.24)
  expect(Maths.round(1.235, 2, RoundingMode.HalfEven)).toBeCloseTo(1.24)
})

test('Maths.random', () => {
  const r = Maths.random(10, 20)
  expect(r).toBeGreaterThanOrEqual(10)
  expect(r).toBeLessThan(20)

  expect(Maths.random(5, 5)).toBeCloseTo(5)
})

test('Maths.greatestCommonFactor', () => {
  expect(Maths.greatestCommonFactor(8, 12)).toBe(4)
  expect(Maths.greatestCommonFactor(100, 10)).toBe(10)
  expect(Maths.greatestCommonFactor(17, 13)).toBe(1)
  expect(Maths.greatestCommonFactor(0, 5)).toBe(5)
  expect(Maths.greatestCommonFactor(5, 0)).toBe(5)
})
