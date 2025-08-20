import { TaggedType } from '@bessemer/cornerstone/types'
import Zod from 'zod'

export type CountryCode = TaggedType<string, 'CountryCode'>

export const of = (value: string): CountryCode => {
  return value as CountryCode
}

export const Schema = Zod.string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{2}$/, 'CountryCode must be exactly 2 uppercase letters')
  .transform(of)

export const fromString = (value: string): CountryCode => {
  return Schema.parse(value)
}

export const UnitedStates = of('US')
export const Canada = of('CA')
export const UnitedKingdom = of('GB')
export const Germany = of('DE')
export const France = of('FR')
export const Italy = of('IT')
export const Spain = of('ES')
export const Portugal = of('PT')
export const Netherlands = of('NL')
export const Belgium = of('BE')
export const Switzerland = of('CH')
export const Austria = of('AT')
export const Sweden = of('SE')
export const Norway = of('NO')
export const Denmark = of('DK')
export const Finland = of('FI')
export const Poland = of('PL')
export const Russia = of('RU')
export const China = of('CN')
export const Japan = of('JP')
export const SouthKorea = of('KR')
export const India = of('IN')
export const Australia = of('AU')
export const NewZealand = of('NZ')
export const Brazil = of('BR')
export const Mexico = of('MX')
export const Argentina = of('AR')
export const SouthAfrica = of('ZA')
export const Turkey = of('TR')
export const Israel = of('IL')
export const SaudiArabia = of('SA')
export const UnitedArabEmirates = of('AE')
export const Singapore = of('SG')
export const Thailand = of('TH')
export const Vietnam = of('VN')
export const Indonesia = of('ID')
export const Malaysia = of('MY')
export const Philippines = of('PH')
