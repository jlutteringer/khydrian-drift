import { Currencies } from '@bessemer/cornerstone'
import { ZodError } from 'zod/v4'

test('Currencies.Schema - valid inputs', () => {
  expect(Currencies.Schema.parse('USD')).toBe('USD')
  expect(Currencies.Schema.parse('usd')).toBe('USD')
  expect(Currencies.Schema.parse('GbP')).toBe('GBP')
  expect(Currencies.Schema.parse('eur')).toBe('EUR')
  expect(Currencies.Schema.parse('JPY')).toBe('JPY')
})

test('Currencies.Schema - handles whitespace', () => {
  expect(Currencies.Schema.parse(' USD ')).toBe('USD')
  expect(Currencies.Schema.parse('\teur\n')).toBe('EUR')
  expect(Currencies.Schema.parse('  gbp  ')).toBe('GBP')
})

test('Currencies.Schema - invalid inputs throw errors', () => {
  expect(() => Currencies.Schema.parse('US')).toThrow(ZodError)
  expect(() => Currencies.Schema.parse('USDD')).toThrow(ZodError)
  expect(() => Currencies.Schema.parse('123')).toThrow(ZodError)
  expect(() => Currencies.Schema.parse('US1')).toThrow(ZodError)
  expect(() => Currencies.Schema.parse('')).toThrow(ZodError)
  expect(() => Currencies.Schema.parse('   ')).toThrow(ZodError)
  expect(() => Currencies.Schema.parse('U$D')).toThrow(ZodError)
})

test('Currencies.Schema - error messages', () => {
  try {
    Currencies.Schema.parse('US')
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError)
  }

  try {
    Currencies.Schema.parse('123')
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError)
  }
})

test('Currencies.of', () => {
  expect(Currencies.of('USD')).toBe('USD')
  expect(Currencies.of('EUR')).toBe('EUR')
  expect(Currencies.of('invalid')).toBe('invalid') // Note: of() doesn't validate
})

test('Currencies.fromString - valid inputs', () => {
  expect(Currencies.fromString('USD')).toBe('USD')
  expect(Currencies.fromString('usd')).toBe('USD')
  expect(Currencies.fromString('GbP')).toBe('GBP')
  expect(Currencies.fromString(' eur ')).toBe('EUR')
})

test('Currencies.fromString - invalid inputs throw errors', () => {
  expect(() => Currencies.fromString('US')).toThrow(ZodError)
  expect(() => Currencies.fromString('USDD')).toThrow(ZodError)
  expect(() => Currencies.fromString('123')).toThrow(ZodError)
  expect(() => Currencies.fromString('')).toThrow(ZodError)
})
