import { DataSizes } from '@bessemer/cornerstone'

test('DataSizes.fromBytes / DataSizes.toBytes', () => {
  const byte = DataSizes.fromBytes(1024)
  expect(DataSizes.toBytes(byte)).toBe(1024)

  const zero = DataSizes.fromBytes(0)
  expect(DataSizes.toBytes(zero)).toBe(0)

  const fractional = DataSizes.fromBytes(12.5)
  expect(DataSizes.toBytes(fractional)).toBe(12.5)
})

test('DataSizes.fromKilobytes / DataSizes.toKilobytes', () => {
  const kb = DataSizes.fromKilobytes(2)
  expect(DataSizes.toBytes(kb)).toBe(2000)
  expect(DataSizes.toKilobytes(kb)).toBe(2)

  const fractional = DataSizes.fromKilobytes(1.5)
  expect(DataSizes.toBytes(fractional)).toBe(1500)
  expect(DataSizes.toKilobytes(fractional)).toBeCloseTo(1.5)
})

test('DataSizes.fromMegabytes / DataSizes.toMegabytes', () => {
  const mb = DataSizes.fromMegabytes(3)
  expect(DataSizes.toBytes(mb)).toBe(3_000_000)
  expect(DataSizes.toMegabytes(mb)).toBe(3)

  const fractional = DataSizes.fromMegabytes(0.5)
  expect(DataSizes.toBytes(fractional)).toBe(500_000)
  expect(DataSizes.toMegabytes(fractional)).toBeCloseTo(0.5)
})

test('DataSizes.fromGigabytes / DataSizes.toGigabytes', () => {
  const gb = DataSizes.fromGigabytes(1)
  expect(DataSizes.toBytes(gb)).toBe(1_000_000_000)
  expect(DataSizes.toGigabytes(gb)).toBe(1)

  const fractional = DataSizes.fromGigabytes(0.25)
  expect(DataSizes.toBytes(fractional)).toBe(250_000_000)
  expect(DataSizes.toGigabytes(fractional)).toBeCloseTo(0.25)
})

test('DataSizes.DataSizeSchema', () => {
  // Should validate number values
  expect(DataSizes.DataSizeSchema.parse(123)).toBe(123)

  // Should reject non-numbers
  expect(() => DataSizes.DataSizeSchema.parse('123')).toThrow()
  expect(() => DataSizes.DataSizeSchema.parse(null)).toThrow()
  expect(() => DataSizes.DataSizeSchema.parse(undefined)).toThrow()
})
