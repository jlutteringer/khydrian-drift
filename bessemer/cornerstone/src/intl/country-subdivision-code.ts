import { TaggedType } from '@bessemer/cornerstone/types'
import Zod from 'zod'
import { CountryCode } from '@bessemer/cornerstone/intl/country-code'

// ISO 3166-2 country subdivision codes
export type CountrySubdivisionCode = TaggedType<string, 'CountrySubdivisionCode'>

export const of = (value: string): CountrySubdivisionCode => {
  return value as CountrySubdivisionCode
}

export const Schema = Zod.string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{2}-[A-Z0-9]{1,3}$/, 'CountrySubdivisionCode must follow ISO 3166-2 format (e.g., US-CA, GB-ENG)')
  .transform(of)

export const fromString = (value: string): CountrySubdivisionCode => {
  return Schema.parse(value)
}

export const getCountry = (code: CountrySubdivisionCode): CountryCode => {
  const countryPart = code.split('-')[0]
  return countryPart as CountryCode
}
