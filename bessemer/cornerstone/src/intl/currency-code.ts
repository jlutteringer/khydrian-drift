import { NominalType } from '@bessemer/cornerstone/types'
import Zod from 'zod'
import { failure, Result, success } from '@bessemer/cornerstone/result'
import { createNamespace } from '@bessemer/cornerstone/resource-key'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'

export const Namespace = createNamespace('currency-code')
export type CurrencyCode = NominalType<string, typeof Namespace>

export const parseString = (value: string): Result<CurrencyCode, ErrorEvent> => {
  if (!/^[A-Z]{3}$/i.test(value)) {
    return failure(invalidValue(value, { namespace: Namespace, message: `Currency Code must be exactly 3 letters.` }))
  }

  return success(value.toUpperCase() as CurrencyCode)
}

export const fromString = (value: string): CurrencyCode => {
  return unpackResult(parseString(value))
}

export const Schema = structuredTransform(Zod.string(), parseString)

export const USD = 'USD' as CurrencyCode
export const EUR = 'EUR' as CurrencyCode
export const GBP = 'GBP' as CurrencyCode
export const JPY = 'JPY' as CurrencyCode
export const CAD = 'CAD' as CurrencyCode
export const AUD = 'AUD' as CurrencyCode
