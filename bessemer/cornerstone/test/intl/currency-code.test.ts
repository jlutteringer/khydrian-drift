import { CurrencyCodes } from '@bessemer/cornerstone'
import { ZodError } from 'zod'

test('Currencies.Schema - valid inputs', () => {
  expect(CurrencyCodes.Schema.parse('USD')).toBe('USD')
  expect(CurrencyCodes.Schema.parse('usd')).toBe('USD')
  expect(CurrencyCodes.Schema.parse('GbP')).toBe('GBP')
  expect(CurrencyCodes.Schema.parse('eur')).toBe('EUR')
  expect(CurrencyCodes.Schema.parse('JPY')).toBe('JPY')
})

test('Currencies.Schema - handles whitespace', () => {
  expect(CurrencyCodes.Schema.parse(' USD ')).toBe('USD')
  expect(CurrencyCodes.Schema.parse('\teur\n')).toBe('EUR')
  expect(CurrencyCodes.Schema.parse('  gbp  ')).toBe('GBP')
})

test('Currencies.Schema - invalid inputs throw errors', () => {
  expect(() => CurrencyCodes.Schema.parse('US')).toThrow(ZodError)
  expect(() => CurrencyCodes.Schema.parse('USDD')).toThrow(ZodError)
  expect(() => CurrencyCodes.Schema.parse('123')).toThrow(ZodError)
  expect(() => CurrencyCodes.Schema.parse('US1')).toThrow(ZodError)
  expect(() => CurrencyCodes.Schema.parse('')).toThrow(ZodError)
  expect(() => CurrencyCodes.Schema.parse('   ')).toThrow(ZodError)
  expect(() => CurrencyCodes.Schema.parse('U$D')).toThrow(ZodError)
})

test('Currencies.Schema - error messages', () => {
  try {
    CurrencyCodes.Schema.parse('US')
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError)
  }

  try {
    CurrencyCodes.Schema.parse('123')
  } catch (error) {
    expect(error).toBeInstanceOf(ZodError)
  }
})

test('Currencies.of', () => {
  expect(CurrencyCodes.of('USD')).toBe('USD')
  expect(CurrencyCodes.of('EUR')).toBe('EUR')
  expect(CurrencyCodes.of('invalid')).toBe('invalid') // Note: of() doesn't validate
})

test('Currencies.fromString - valid inputs', () => {
  expect(CurrencyCodes.fromString('USD')).toBe('USD')
  expect(CurrencyCodes.fromString('usd')).toBe('USD')
  expect(CurrencyCodes.fromString('GbP')).toBe('GBP')
  expect(CurrencyCodes.fromString(' eur ')).toBe('EUR')
})

test('Currencies.fromString - invalid inputs throw errors', () => {
  expect(() => CurrencyCodes.fromString('US')).toThrow(ZodError)
  expect(() => CurrencyCodes.fromString('USDD')).toThrow(ZodError)
  expect(() => CurrencyCodes.fromString('123')).toThrow(ZodError)
  expect(() => CurrencyCodes.fromString('')).toThrow(ZodError)
})
