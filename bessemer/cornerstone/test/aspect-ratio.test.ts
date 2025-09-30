import { AspectRatios } from '@bessemer/cornerstone'
import { AspectRatio } from '@bessemer/cornerstone/aspect-ratio'

test('AspectRatios.buildSchema', () => {
  expect(AspectRatios.Schema.parse('16:9')).toBe('16:9')
  expect(AspectRatios.Schema.parse('4:3')).toBe('4:3')
  expect(AspectRatios.Schema.parse('100:25')).toBe('100:25')
  expect(() => AspectRatios.Schema.parse('')).toThrow()
  expect(() => AspectRatios.Schema.parse('  16:9  ')).toThrow()
  expect(() => AspectRatios.Schema.parse('169')).toThrow()
  expect(() => AspectRatios.Schema.parse('abc:def')).toThrow()
  expect(() => AspectRatios.Schema.parse('0:9')).toThrow()
  expect(() => AspectRatios.Schema.parse('-1:9')).toThrow()
  expect(() => AspectRatios.Schema.parse('16:0')).toThrow()
  expect(() => AspectRatios.Schema.parse(undefined as unknown as string)).toThrow()
})

test('AspectRatios.fromString', () => {
  expect(AspectRatios.fromString('16:9')).toBe('16:9')
  expect(AspectRatios.fromString('4:3')).toBe('4:3')

  expect(() => AspectRatios.fromString('16/9')).toThrow()
  expect(() => AspectRatios.fromString('bad:ratio')).toThrow()
  expect(() => AspectRatios.fromString('abc')).toThrow()
})

test('AspectRatios.fromDimensions', () => {
  expect(AspectRatios.fromDimensions(1920, 1080)).toBe('16:9')
  expect(AspectRatios.fromDimensions(1280, 960)).toBe('4:3')
  expect(AspectRatios.fromDimensions(100, 100)).toBe('1:1')
  expect(AspectRatios.fromDimensions(300, 100)).toBe('3:1')
})

test('AspectRatios.numericValue', () => {
  expect(AspectRatios.numericValue('16:9' as AspectRatio)).toBeCloseTo(16 / 9)
  expect(AspectRatios.numericValue('4:3' as AspectRatio)).toBeCloseTo(4 / 3)
  expect(AspectRatios.numericValue('1:1' as AspectRatio)).toBeCloseTo(1)
})

test('AspectRatios.calculateHeight', () => {
  expect(AspectRatios.calculateHeight(1920, '16:9' as AspectRatio)).toBeCloseTo(1080)
  expect(AspectRatios.calculateHeight(800, '4:3' as AspectRatio)).toBeCloseTo(600)
  expect(AspectRatios.calculateHeight(500, '1:1' as AspectRatio)).toBeCloseTo(500)
})

test('AspectRatios.calculateWidth', () => {
  expect(AspectRatios.calculateWidth(1080, '16:9' as AspectRatio)).toBeCloseTo(1920)
  expect(AspectRatios.calculateWidth(600, '4:3' as AspectRatio)).toBeCloseTo(800)
  expect(AspectRatios.calculateWidth(500, '1:1' as AspectRatio)).toBeCloseTo(500)
})
