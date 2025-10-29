import { NominalType } from '@bessemer/cornerstone/types'
import Zod from 'zod'
import { failure, Result, success } from '@bessemer/cornerstone/result'
import { createNamespace } from '@bessemer/cornerstone/resource-key'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'

// ISO 639 language codes
export const Namespace = createNamespace('language-code')
export type LanguageCode = NominalType<string, typeof Namespace>

export const parseString = (value: string): Result<LanguageCode, ErrorEvent> => {
  if (!/^[a-z]{2}$/i.test(value)) {
    return failure(invalidValue(value, { namespace: Namespace, message: `CountryCode must be exactly 2 letters.` }))
  }

  return success(value.toLowerCase() as LanguageCode)
}

export const from = (value: string): LanguageCode => {
  return unpackResult(parseString(value))
}

export const Schema = structuredTransform(Zod.string(), parseString)

export const English = 'en' as LanguageCode
export const Spanish = 'es' as LanguageCode
export const French = 'fr' as LanguageCode
export const German = 'de' as LanguageCode
export const Italian = 'it' as LanguageCode
export const Portuguese = 'pt' as LanguageCode
export const Dutch = 'nl' as LanguageCode
export const Russian = 'ru' as LanguageCode
export const Chinese = 'zh' as LanguageCode
export const Japanese = 'ja' as LanguageCode
export const Korean = 'ko' as LanguageCode
export const Arabic = 'ar' as LanguageCode
export const Hindi = 'hi' as LanguageCode
export const Turkish = 'tr' as LanguageCode
export const Polish = 'pl' as LanguageCode
export const Swedish = 'sv' as LanguageCode
export const Norwegian = 'no' as LanguageCode
export const Danish = 'da' as LanguageCode
export const Finnish = 'fi' as LanguageCode
export const Greek = 'el' as LanguageCode
export const Hebrew = 'he' as LanguageCode
export const Thai = 'th' as LanguageCode
export const Vietnamese = 'vi' as LanguageCode
export const Indonesian = 'id' as LanguageCode
export const Malay = 'ms' as LanguageCode
