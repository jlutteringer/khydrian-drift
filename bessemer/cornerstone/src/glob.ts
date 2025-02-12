import { minimatch } from 'minimatch'
import { NominalType } from '@bessemer/cornerstone/types'

export type GlobPattern = NominalType<string, 'GlobPattern'>

export const match = (str: string, pattern: GlobPattern): boolean => {
  return minimatch(str, pattern)
}

export const anyMatch = (str: string, patterns: Array<GlobPattern>): boolean => {
  return patterns.some((it) => match(str, it))
}
