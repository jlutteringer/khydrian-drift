import { TaggedType } from '@bessemer/cornerstone/types'
import Zod from 'zod'

// ISO 639 language codes
export type LanguageCode = TaggedType<string, 'LanguageCode'>

export const of = (value: string): LanguageCode => {
  return value as LanguageCode
}

export const Schema = Zod.string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z]{2}$/, 'LanguageCode must be exactly 2 lowercase letters')
  .transform(of)

export const fromString = (value: string): LanguageCode => {
  return Schema.parse(value)
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
export const Arabic = of('ar')
export const Hindi = of('hi')
export const Turkish = of('tr')
export const Polish = of('pl')
export const Swedish = of('sv')
export const Norwegian = of('no')
export const Danish = of('da')
export const Finnish = of('fi')
export const Greek = of('el')
export const Hebrew = of('he')
export const Thai = of('th')
export const Vietnamese = of('vi')
export const Indonesian = of('id')
export const Malay = of('ms')
