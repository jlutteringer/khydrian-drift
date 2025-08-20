import { TaggedType } from '@bessemer/cornerstone/types'
import Zod from 'zod'
import { fromString as languageCodeFromString, LanguageCode } from '@bessemer/cornerstone/intl/language-code'
import { CountryCode, fromString as countryCodeFromString } from '@bessemer/cornerstone/intl/country-code'
import { isPresent } from '@bessemer/cornerstone/object'
import { Assertions } from '@bessemer/cornerstone'

export type Locale = TaggedType<string, 'Locale'>
export const Schema = Zod.string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z]{2}(-[a-z]{2})?$/, 'Locale must be in format "en" or "en-US"')
  .transform((value) => {
    const parts = value.split('-')
    Assertions.assertPresent(parts[0])
    const languageCode = languageCodeFromString(parts[0])
    const countryCode = isPresent(parts[1]) ? countryCodeFromString(parts[1]) : null

    return fromCode(languageCode, countryCode)
  })

export const of = (value: string): Locale => {
  return value as Locale
}

export const fromString = (value: string): Locale => {
  return Schema.parse(value)
}

export const fromCode = (language: LanguageCode, country?: CountryCode | null): Locale => {
  if (isPresent(country)) {
    return of(`${language}-${country}`)
  } else {
    return of(language)
  }
}

export const parse = (locale: Locale): [LanguageCode, CountryCode | null] => {
  const parts = locale.split('-')
  const languageCode = parts[0] as LanguageCode
  const countryCode = isPresent(parts[1]) ? (parts[1] as CountryCode) : null
  return [languageCode, countryCode]
}

export const English = of('en')
export const Spanish = of('es')
export const French = of('fr')
export const German = of('de')
export const Italian = of('it')
export const Portuguese = of('pt')
export const Dutch = of('nl')
export const Russian = of('ru')
export const Chinese = of('zh')
export const Japanese = of('ja')
export const Korean = of('ko')

export const AmericanEnglish = of('en-US')
export const BritishEnglish = of('en-GB')
export const CanadianEnglish = of('en-CA')
export const AustralianEnglish = of('en-AU')
