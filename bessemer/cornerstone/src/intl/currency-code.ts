import { TaggedType } from '@bessemer/cornerstone/types'
import Zod from 'zod'

export type CurrencyCode = TaggedType<string, 'CurrencyCode'>

export const of = (value: string): CurrencyCode => {
  return value as CurrencyCode
}

export const Schema = Zod.string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, 'Currency Code must be exactly 3 letters')
  .transform(of)

export const fromString = (value: string): CurrencyCode => {
  return Schema.parse(value)
}

export const USD = of('USD')
export const EUR = of('EUR')
export const GBP = of('GBP')
export const JPY = of('JPY')
export const CAD = of('CAD')
export const AUD = of('AUD')
