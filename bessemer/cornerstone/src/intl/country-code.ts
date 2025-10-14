import { NominalType } from '@bessemer/cornerstone/types'
import Zod from 'zod'
import { failure, Result, success } from '@bessemer/cornerstone/result'
import { createNamespace } from '@bessemer/cornerstone/resource-key'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'

export const Namespace = createNamespace('country-code')
export type CountryCode = NominalType<string, typeof Namespace>

export const parseString = (value: string): Result<CountryCode, ErrorEvent> => {
  if (!/^[A-Z]{2}$/i.test(value)) {
    return failure(invalidValue(value, { namespace: Namespace, message: `CountryCode must be exactly 2 letters.` }))
  }

  return success(value.toUpperCase() as CountryCode)
}

export const fromString = (value: string): CountryCode => {
  return unpackResult(parseString(value))
}

export const Schema = structuredTransform(Zod.string(), parseString)

export const UnitedStates = 'US' as CountryCode
export const Canada = 'CA' as CountryCode
export const UnitedKingdom = 'GB' as CountryCode
export const Germany = 'DE' as CountryCode
export const France = 'FR' as CountryCode
export const Italy = 'IT' as CountryCode
export const Spain = 'ES' as CountryCode
export const Portugal = 'PT' as CountryCode
export const Netherlands = 'NL' as CountryCode
export const Belgium = 'BE' as CountryCode
export const Switzerland = 'CH' as CountryCode
export const Austria = 'AT' as CountryCode
export const Sweden = 'SE' as CountryCode
export const Norway = 'NO' as CountryCode
export const Denmark = 'DK' as CountryCode
export const Finland = 'FI' as CountryCode
export const Poland = 'PL' as CountryCode
export const Russia = 'RU' as CountryCode
export const China = 'CN' as CountryCode
export const Japan = 'JP' as CountryCode
export const SouthKorea = 'KR' as CountryCode
export const India = 'IN' as CountryCode
export const Australia = 'AU' as CountryCode
export const NewZealand = 'NZ' as CountryCode
export const Brazil = 'BR' as CountryCode
export const Mexico = 'MX' as CountryCode
export const Argentina = 'AR' as CountryCode
export const SouthAfrica = 'ZA' as CountryCode
export const Turkey = 'TR' as CountryCode
export const Israel = 'IL' as CountryCode
export const SaudiArabia = 'SA' as CountryCode
export const UnitedArabEmirates = 'AE' as CountryCode
export const Singapore = 'SG' as CountryCode
export const Thailand = 'TH' as CountryCode
export const Vietnam = 'VN' as CountryCode
export const Indonesia = 'ID' as CountryCode
export const Malaysia = 'MY' as CountryCode
export const Philippines = 'PH' as CountryCode
