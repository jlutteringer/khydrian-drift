import { minimatch } from 'minimatch'
import { NominalType } from '@bessemer/cornerstone/types'
import { ZodType } from 'zod'
import { string } from '@bessemer/cornerstone/zod'

export type GlobPattern = NominalType<string, 'GlobPattern'>
export const GlobPatternSchema: ZodType<GlobPattern> = string()

export const schema = (): ZodType<GlobPattern> => {
  return string()
}

export const match = (str: string, pattern: GlobPattern): boolean => {
  return minimatch(str, pattern)
}

export const anyMatch = (str: string, patterns: Array<GlobPattern>): boolean => {
  return patterns.some((it) => match(str, it))
}
