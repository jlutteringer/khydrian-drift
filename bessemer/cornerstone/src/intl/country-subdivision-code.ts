import { NominalType } from '@bessemer/cornerstone/types'
import Zod from 'zod'
import { CountryCode } from '@bessemer/cornerstone/intl/country-code'
import { failure, Result, success } from '@bessemer/cornerstone/result'
import { createNamespace } from '@bessemer/cornerstone/resource-key'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'

// ISO 3166-2 country subdivision codes
export const Namespace = createNamespace('country-subdivision-code')
export type CountrySubdivisionCode = NominalType<string, typeof Namespace>

export const parseString = (value: string): Result<CountrySubdivisionCode, ErrorEvent> => {
  if (!/^[A-Z]{2}-[A-Z0-9]{1,3}$/i.test(value)) {
    return failure(
      invalidValue(value, { namespace: Namespace, message: `CountrySubdivisionCode must follow ISO 3166-2 format (e.g., US-CA, GB-ENG).` })
    )
  }

  return success(value.toUpperCase() as CountrySubdivisionCode)
}

export const from = (value: string): CountrySubdivisionCode => {
  return unpackResult(parseString(value))
}

export const Schema = structuredTransform(Zod.string(), parseString)

export const getCountry = (code: CountrySubdivisionCode): CountryCode => {
  const countryPart = code.split('-')[0]
  return countryPart as CountryCode
}
