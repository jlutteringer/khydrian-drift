import Zod from 'zod'
import { TaggedType } from '@bessemer/cornerstone/types'

export type HexCode = TaggedType<string, 'HexCode'>

export const of = (value: string): HexCode => {
  return value as HexCode
}

export const Schema = Zod.string().length(7).startsWith('#').describe('A 6-digit hex code starting a # sign').transform(of)

export const fromString = (value: string): HexCode => {
  return Schema.parse(value)
}
