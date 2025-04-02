import { NominalType } from '@bessemer/cornerstone/types'
import { Zod } from '@bessemer/cornerstone/index'
import { ZodType } from 'zod'

export type HexCode = NominalType<string, 'HexCode'>
export const HexCodeSchema: ZodType<HexCode> = Zod.string().length(7).startsWith('#').describe('A 6-digit hex code starting a # sign')
