import Zod, { ZodType } from 'zod'
import { TaggedType } from '@bessemer/cornerstone/types'

export type HexCode = TaggedType<string, 'HexCode'>
export const Schema: ZodType<HexCode> = Zod.string().length(7).startsWith('#').describe('A 6-digit hex code starting a # sign') as any

export const of = (value: string): HexCode => {
  return value as HexCode
}

export const fromString = (value: string): HexCode => {
  return Schema.parse(value)
}
