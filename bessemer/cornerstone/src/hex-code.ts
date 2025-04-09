import { Zod } from '@bessemer/cornerstone'

export const HexCodeSchema = Zod.string().length(7).startsWith('#').describe('A 6-digit hex code starting a # sign').brand('HexCode')
export type HexCode = Zod.infer<typeof HexCodeSchema>
