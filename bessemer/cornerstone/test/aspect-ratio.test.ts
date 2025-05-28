import { AspectRatios } from '@bessemer/cornerstone'

test('AspectRatios.buildSchema', () => {
  const schema = AspectRatios.buildSchema()
  expect(schema.parse('16:9')).toBe('16:9')
  expect(schema.parse('4:3')).toBe('4:3')
  expect(schema.parse('100:25')).toBe('100:25')
  expect(schema.parse('  16:9  ')).toBe('16:9')
  expect(() => schema.parse('')).toThrow()
  expect(() => schema.parse('169')).toThrow()
  expect(() => schema.parse('abc:def')).toThrow()
  expect(() => schema.parse('0:9')).toThrow()
  expect(() => schema.parse('-1:9')).toThrow()
  expect(() => schema.parse('16:0')).toThrow()
  expect(() => schema.parse(undefined as unknown as string)).toThrow()
})

test('AspectRatios.of', () => {
  expect(AspectRatios.of('16:9')).toBe('16:9')
  expect(AspectRatios.of('4:3')).toBe('4:3')
  expect(AspectRatios.of('1:1')).toBe('1:1')
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
  expect(AspectRatios.numericValue('16:9')).toBeCloseTo(16 / 9)
  expect(AspectRatios.numericValue('4:3')).toBeCloseTo(4 / 3)
  expect(AspectRatios.numericValue('1:1')).toBeCloseTo(1)
})

test('AspectRatios.calculateHeight', () => {
  expect(AspectRatios.calculateHeight(1920, '16:9')).toBeCloseTo(1080)
  expect(AspectRatios.calculateHeight(800, '4:3')).toBeCloseTo(600)
  expect(AspectRatios.calculateHeight(500, '1:1')).toBeCloseTo(500)
})

test('AspectRatios.calculateWidth', () => {
  expect(AspectRatios.calculateWidth(1080, '16:9')).toBeCloseTo(1920)
  expect(AspectRatios.calculateWidth(600, '4:3')).toBeCloseTo(800)
  expect(AspectRatios.calculateWidth(500, '1:1')).toBeCloseTo(500)
})
