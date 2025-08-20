import { CurrencyCodes, MonetaryAmounts } from '@bessemer/cornerstone'
import { ZodError } from 'zod'

test('MonetaryAmounts.Schema - valid inputs', () => {
  expect(MonetaryAmounts.Schema.parse({ amount: 100, currency: CurrencyCodes.USD })).toEqual({ amount: 100, currency: CurrencyCodes.USD })
  expect(MonetaryAmounts.Schema.parse({ amount: 0, currency: CurrencyCodes.EUR })).toEqual({ amount: 0, currency: CurrencyCodes.EUR })
  expect(MonetaryAmounts.Schema.parse({ amount: -50, currency: CurrencyCodes.GBP })).toEqual({ amount: -50, currency: CurrencyCodes.GBP })
})

test('MonetaryAmounts.Schema - invalid inputs throw errors', () => {
  expect(() => MonetaryAmounts.Schema.parse({ amount: 10.5, currency: CurrencyCodes.USD })).toThrow(ZodError)
  expect(() => MonetaryAmounts.Schema.parse({ amount: 'invalid', currency: CurrencyCodes.USD })).toThrow(ZodError)
  expect(() => MonetaryAmounts.Schema.parse({ amount: 100, currency: 'INVALID' })).toThrow(ZodError)
  expect(() => MonetaryAmounts.Schema.parse({ amount: 100 })).toThrow(ZodError)
  expect(() => MonetaryAmounts.Schema.parse({ currency: CurrencyCodes.USD })).toThrow(ZodError)
})

test('MonetaryAmounts.of', () => {
  expect(MonetaryAmounts.of(100, CurrencyCodes.USD)).toEqual({ amount: 100, currency: CurrencyCodes.USD })
  expect(MonetaryAmounts.of(0, CurrencyCodes.EUR)).toEqual({ amount: 0, currency: CurrencyCodes.EUR })
  expect(MonetaryAmounts.of(-50, CurrencyCodes.GBP)).toEqual({ amount: -50, currency: CurrencyCodes.GBP })
})

test('MonetaryAmounts.of - throws on non-integer amounts', () => {
  expect(() => MonetaryAmounts.of(10.5, CurrencyCodes.USD)).toThrow()
  expect(() => MonetaryAmounts.of(3.14, CurrencyCodes.EUR)).toThrow()
})

test('MonetaryAmounts.zero', () => {
  expect(MonetaryAmounts.zero(CurrencyCodes.USD)).toEqual({ amount: 0, currency: CurrencyCodes.USD })
  expect(MonetaryAmounts.zero(CurrencyCodes.EUR)).toEqual({ amount: 0, currency: CurrencyCodes.EUR })
})

test('MonetaryAmounts.apply - same currency', () => {
  const first = MonetaryAmounts.of(100, CurrencyCodes.USD)
  const second = MonetaryAmounts.of(50, CurrencyCodes.USD)

  expect(MonetaryAmounts.apply(first, second, (a, b) => a + b)).toBe(150)
  expect(MonetaryAmounts.apply(first, second, (a, b) => a - b)).toBe(50)
  expect(MonetaryAmounts.apply(first, second, (a, b) => a > b)).toBe(true)
})

test('MonetaryAmounts.apply - different currencies throw error', () => {
  const usd = MonetaryAmounts.of(100, CurrencyCodes.USD)
  const eur = MonetaryAmounts.of(50, CurrencyCodes.EUR)

  expect(() => MonetaryAmounts.apply(usd, eur, (a, b) => a + b)).toThrow('Currency mismatch in operation on MonetaryAmount: USD, EUR')
})

test('MonetaryAmounts.operate', () => {
  const first = MonetaryAmounts.of(100, CurrencyCodes.USD)
  const second = MonetaryAmounts.of(50, CurrencyCodes.USD)

  expect(MonetaryAmounts.operate(first, second, (a, b) => a + b)).toEqual({ amount: 150, currency: CurrencyCodes.USD })
  expect(MonetaryAmounts.operate(first, second, (a, b) => a - b)).toEqual({ amount: 50, currency: CurrencyCodes.USD })
})

test('MonetaryAmounts.equal', () => {
  const amount1 = MonetaryAmounts.of(100, CurrencyCodes.USD)
  const amount2 = MonetaryAmounts.of(100, CurrencyCodes.USD)
  const amount3 = MonetaryAmounts.of(50, CurrencyCodes.USD)
  const amount4 = MonetaryAmounts.of(100, CurrencyCodes.EUR)

  expect(MonetaryAmounts.equal(amount1, amount2)).toBe(true)
  expect(MonetaryAmounts.equal(amount1, amount3)).toBe(false)
  expect(() => MonetaryAmounts.equal(amount1, amount4)).toThrow()

  expect(MonetaryAmounts.equal(null, null)).toBe(true)
  expect(MonetaryAmounts.equal(undefined, undefined)).toBe(true)
  expect(MonetaryAmounts.equal(null, undefined)).toBe(true)
  expect(MonetaryAmounts.equal(amount1, null)).toBe(false)
  expect(MonetaryAmounts.equal(null, amount1)).toBe(false)
})

test('MonetaryAmounts.sum', () => {
  const amount1 = MonetaryAmounts.of(100, CurrencyCodes.USD)
  const amount2 = MonetaryAmounts.of(50, CurrencyCodes.USD)

  expect(MonetaryAmounts.sum(amount1, amount2)).toEqual({ amount: 150, currency: CurrencyCodes.USD })
  expect(MonetaryAmounts.sum(amount1, null)).toEqual({ amount: 100, currency: CurrencyCodes.USD })
  expect(MonetaryAmounts.sum(amount1)).toEqual({ amount: 100, currency: CurrencyCodes.USD })
})

test('MonetaryAmounts.subtract', () => {
  const amount1 = MonetaryAmounts.of(100, CurrencyCodes.USD)
  const amount2 = MonetaryAmounts.of(30, CurrencyCodes.USD)

  expect(MonetaryAmounts.subtract(amount1, amount2)).toEqual({ amount: 70, currency: CurrencyCodes.USD })
})

test('MonetaryAmounts.multiply', () => {
  const amount = MonetaryAmounts.of(100, CurrencyCodes.USD)

  expect(MonetaryAmounts.multiply(amount, 2)).toEqual({ amount: 200, currency: CurrencyCodes.USD })
  expect(MonetaryAmounts.multiply(amount, 0.5)).toEqual({ amount: 50, currency: CurrencyCodes.USD })
  expect(MonetaryAmounts.multiply(amount, 1.5)).toEqual({ amount: 150, currency: CurrencyCodes.USD })
})

test('MonetaryAmounts.divide', () => {
  const amount = MonetaryAmounts.of(100, CurrencyCodes.USD)

  expect(MonetaryAmounts.divide(amount, 2)).toEqual({ amount: 50, currency: CurrencyCodes.USD })
  expect(MonetaryAmounts.divide(amount, 4)).toEqual({ amount: 25, currency: CurrencyCodes.USD })
})

test('MonetaryAmounts.sumAll - non-empty array', () => {
  const amounts = [
    MonetaryAmounts.of(100, CurrencyCodes.USD),
    MonetaryAmounts.of(50, CurrencyCodes.USD),
    MonetaryAmounts.of(25, CurrencyCodes.USD),
  ] as const
  expect(MonetaryAmounts.sumAll(amounts)).toEqual({ amount: 175, currency: CurrencyCodes.USD })
})

test('MonetaryAmounts.sumAll - single item array', () => {
  const amounts = [MonetaryAmounts.of(100, CurrencyCodes.USD)] as const
  expect(MonetaryAmounts.sumAll(amounts)).toEqual({ amount: 100, currency: CurrencyCodes.USD })
})

test('MonetaryAmounts.negate', () => {
  expect(MonetaryAmounts.negate(MonetaryAmounts.of(100, CurrencyCodes.USD))).toEqual({ amount: -100, currency: CurrencyCodes.USD })
  expect(MonetaryAmounts.negate(MonetaryAmounts.of(-50, CurrencyCodes.EUR))).toEqual({ amount: 50, currency: CurrencyCodes.EUR })
  expect(MonetaryAmounts.negate(MonetaryAmounts.of(0, CurrencyCodes.GBP))).toEqual({ amount: 0, currency: CurrencyCodes.GBP })
})

test('MonetaryAmounts.isZero', () => {
  expect(MonetaryAmounts.isZero(MonetaryAmounts.of(0, CurrencyCodes.USD))).toBe(true)
  expect(MonetaryAmounts.isZero(MonetaryAmounts.of(100, CurrencyCodes.USD))).toBe(false)
  expect(MonetaryAmounts.isZero(MonetaryAmounts.of(-50, CurrencyCodes.USD))).toBe(false)
})

test('MonetaryAmounts.greaterThan', () => {
  const amount1 = MonetaryAmounts.of(100, CurrencyCodes.USD)
  const amount2 = MonetaryAmounts.of(50, CurrencyCodes.USD)
  const amount3 = MonetaryAmounts.of(100, CurrencyCodes.USD)

  expect(MonetaryAmounts.greaterThan(amount1, amount2)).toBe(true)
  expect(MonetaryAmounts.greaterThan(amount2, amount1)).toBe(false)
  expect(MonetaryAmounts.greaterThan(amount1, amount3)).toBe(false)
})

test('MonetaryAmounts.format - basic formatting', () => {
  const amount = MonetaryAmounts.of(12345, CurrencyCodes.USD) // $123.45

  expect(MonetaryAmounts.format(amount, 'en-US')).toBe('$123.45')

  const wholeAmount = MonetaryAmounts.of(12300, CurrencyCodes.USD) // $123.00
  const fractionalAmount = MonetaryAmounts.of(12345, CurrencyCodes.USD) // $123.45

  expect(MonetaryAmounts.format(wholeAmount, 'en-US', { hideCents: true })).toBe('$123')
  expect(MonetaryAmounts.format(fractionalAmount, 'en-US', { hideCents: true })).toBe('$123.45')
})

test('MonetaryAmounts.format - with hideCents option', () => {
  const wholeAmount = MonetaryAmounts.of(12300, CurrencyCodes.USD) // $123.00
  const fractionalAmount = MonetaryAmounts.of(12345, CurrencyCodes.USD) // $123.45

  expect(MonetaryAmounts.format(wholeAmount, 'en-US', { hideCents: true })).toBe('$123')
  expect(MonetaryAmounts.format(fractionalAmount, 'en-US', { hideCents: true })).toBe('$123.45')
})
