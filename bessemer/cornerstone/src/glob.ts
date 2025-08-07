import { minimatch } from 'minimatch'
import { NominalType } from '@bessemer/cornerstone/types'
import Zod, { ZodType } from 'zod/v4'

export type GlobPattern = NominalType<string, 'GlobPattern'>

export const Schema: ZodType<GlobPattern> = Zod.string().refine((val) => {
  // Check for valid glob characters and patterns
  const validGlobPattern = /^[a-zA-Z0-9\-_.\/\\*?\[\]{}!,|]+$/

  // Basic validation - contains valid characters
  if (!validGlobPattern.test(val)) {
    return false
  }

  // Check for balanced brackets
  const brackets = val.match(/[\[\]]/g)
  if (brackets) {
    const openBrackets = (val.match(/\[/g) || []).length
    const closeBrackets = (val.match(/]/g) || []).length
    if (openBrackets !== closeBrackets) {
      return false
    }
  }

  // Check for balanced braces
  const braces = val.match(/[{}]/g)
  if (braces) {
    const openBraces = (val.match(/\{/g) || []).length
    const closeBraces = (val.match(/}/g) || []).length
    if (openBraces !== closeBraces) {
      return false
    }
  }

  return true
}, 'Invalid glob pattern')

export const fromString = (value: string): GlobPattern => {
  return Schema.parse(value)
}

export const match = (str: string, pattern: GlobPattern): boolean => {
  return minimatch(str, pattern)
}

export const anyMatch = (str: string, patterns: Array<GlobPattern>): boolean => {
  return patterns.some((it) => match(str, it))
}
