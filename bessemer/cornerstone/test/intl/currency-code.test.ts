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

test('Currencies.from - valid inputs', () => {
  expect(CurrencyCodes.from('USD')).toBe('USD')
  expect(CurrencyCodes.from('usd')).toBe('USD')
  expect(CurrencyCodes.from('GbP')).toBe('GBP')
  expect(CurrencyCodes.from('eur')).toBe('EUR')
})

test('Currencies.from - invalid inputs throw errors', () => {
  expect(() => CurrencyCodes.from('US')).toThrow()
  expect(() => CurrencyCodes.from('USDD')).toThrow()
  expect(() => CurrencyCodes.from('123')).toThrow()
  expect(() => CurrencyCodes.from('')).toThrow()
})
