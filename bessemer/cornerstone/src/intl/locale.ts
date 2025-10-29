import { NominalType } from '@bessemer/cornerstone/types'
import Zod from 'zod'
import { from as languageCodeFromString, LanguageCode } from '@bessemer/cornerstone/intl/language-code'
import { CountryCode, from as countryCodeFromString } from '@bessemer/cornerstone/intl/country-code'
import { isPresent } from '@bessemer/cornerstone/object'
import { Assertions } from '@bessemer/cornerstone'
import { failure, Result, success } from '@bessemer/cornerstone/result'
import { createNamespace } from '@bessemer/cornerstone/resource-key'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'

export const Namespace = createNamespace('locale')
export type Locale = NominalType<string, typeof Namespace>

export const fromCode = (language: LanguageCode, country?: CountryCode | null): Locale => {
  if (isPresent(country)) {
    return `${language}-${country}` as Locale
  } else {
    return `${language}` as Locale
  }
}

export const parseString = (value: string): Result<Locale, ErrorEvent> => {
  if (!/^[a-z]{2}(-[a-z]{2})?$/i.test(value)) {
    return failure(invalidValue(value, { namespace: Namespace, message: `Locale must be in format "en" or "en-US".` }))
  }

  const parts = value.split('-')
  Assertions.assertPresent(parts[0])
  const languageCode = languageCodeFromString(parts[0])
  const countryCode = isPresent(parts[1]) ? countryCodeFromString(parts[1]) : null
  return success(fromCode(languageCode, countryCode))
}

export const from = (value: string): Locale => {
  return unpackResult(parseString(value))
}

export const Schema = structuredTransform(Zod.string(), parseString)

export const parse = (locale: Locale): [LanguageCode, CountryCode | null] => {
  const parts = locale.split('-')
  const languageCode = parts[0] as LanguageCode
  const countryCode = isPresent(parts[1]) ? (parts[1] as CountryCode) : null
  return [languageCode, countryCode]
}

export const English = 'en' as Locale
export const Spanish = 'es' as Locale
export const French = 'fr' as Locale
export const German = 'de' as Locale
export const Italian = 'it' as Locale
export const Portuguese = 'pt' as Locale
export const Dutch = 'nl' as Locale
export const Russian = 'ru' as Locale
export const Chinese = 'zh' as Locale
export const Japanese = 'ja' as Locale
export const Korean = 'ko' as Locale

export const AmericanEnglish = 'en-US' as Locale
export const BritishEnglish = 'en-GB' as Locale
export const CanadianEnglish = 'en-CA' as Locale
export const AustralianEnglish = 'en-AU' as Locale
