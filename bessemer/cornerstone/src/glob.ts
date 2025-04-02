import { minimatch } from 'minimatch'
import { NominalType } from '@bessemer/cornerstone/types'
import { Zod } from '@bessemer/cornerstone'
import { ZodType } from 'zod'

export type GlobPattern = NominalType<string, 'GlobPattern'>
export const GlobPatternSchema: ZodType<GlobPattern> = Zod.string()

export const schema = (): ZodType<GlobPattern> => {
  return Zod.string()
}

export const match = (str: string, pattern: GlobPattern): boolean => {
  return minimatch(str, pattern)
}

export const anyMatch = (str: string, patterns: Array<GlobPattern>): boolean => {
  return patterns.some((it) => match(str, it))
}
