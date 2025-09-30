import { CurrencyCodes } from '@bessemer/cornerstone'

test('Currencies.Schema - valid inputs', () => {
  expect(CurrencyCodes.Schema.parse('USD')).toBe('USD')
  expect(CurrencyCodes.Schema.parse('usd')).toBe('USD')
  expect(CurrencyCodes.Schema.parse('GbP')).toBe('GBP')
  expect(CurrencyCodes.Schema.parse('eur')).toBe('EUR')
  expect(CurrencyCodes.Schema.parse('JPY')).toBe('JPY')
})

test('Currencies.Schema - invalid inputs throw errors', () => {
  expect(() => CurrencyCodes.Schema.parse('US')).toThrow()
  expect(() => CurrencyCodes.Schema.parse('USDD')).toThrow()
  expect(() => CurrencyCodes.Schema.parse('123')).toThrow()
  expect(() => CurrencyCodes.Schema.parse('US1')).toThrow()
  expect(() => CurrencyCodes.Schema.parse('')).toThrow()
  expect(() => CurrencyCodes.Schema.parse('   ')).toThrow()
  expect(() => CurrencyCodes.Schema.parse('U$D')).toThrow()
})

test('Currencies.fromString - valid inputs', () => {
  expect(CurrencyCodes.fromString('USD')).toBe('USD')
  expect(CurrencyCodes.fromString('usd')).toBe('USD')
  expect(CurrencyCodes.fromString('GbP')).toBe('GBP')
  expect(CurrencyCodes.fromString('eur')).toBe('EUR')
})

test('Currencies.fromString - invalid inputs throw errors', () => {
  expect(() => CurrencyCodes.fromString('US')).toThrow()
  expect(() => CurrencyCodes.fromString('USDD')).toThrow()
  expect(() => CurrencyCodes.fromString('123')).toThrow()
  expect(() => CurrencyCodes.fromString('')).toThrow()
})
