import { minimatch } from 'minimatch'
import Zod from 'zod'
import { failure, Result, success } from '@bessemer/cornerstone/result'
import { NominalType } from '@bessemer/cornerstone/types'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { createNamespace } from '@bessemer/cornerstone/resource-key'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'

export const Namespace = createNamespace('glob-pattern')
export type GlobPattern = NominalType<string, typeof Namespace>

export const parseString = (value: string): Result<GlobPattern, ErrorEvent> => {
  // Check for valid glob characters and patterns
  const validGlobPattern = /^[a-zA-Z0-9\-_.\/\\*?\[\]{}!,|]+$/

  // Basic validation - contains valid characters
  if (!validGlobPattern.test(value)) {
    return failure(invalidValue(value, { namespace: Namespace, message: `GlobPattern contains invalid characters.` }))
  }

  // Check for balanced brackets
  const brackets = value.match(/[\[\]]/g)
  if (brackets) {
    const openBrackets = (value.match(/\[/g) || []).length
    const closeBrackets = (value.match(/]/g) || []).length
    if (openBrackets !== closeBrackets) {
      return failure(invalidValue(value, { namespace: Namespace, message: `GlobPattern has unbalanced brackets.` }))
    }
  }

  // Check for balanced braces
  const braces = value.match(/[{}]/g)
  if (braces) {
    const openBraces = (value.match(/\{/g) || []).length
    const closeBraces = (value.match(/}/g) || []).length
    if (openBraces !== closeBraces) {
      return failure(invalidValue(value, { namespace: Namespace, message: `GlobPattern has unbalanced braces.` }))
    }
  }

  return success(value as GlobPattern)
}

export const fromString = (value: string): GlobPattern => {
  return unpackResult(parseString(value))
}

export const Schema = structuredTransform(Zod.string(), parseString)

export const match = (str: string, pattern: GlobPattern): boolean => {
  return minimatch(str, pattern)
}

export const anyMatch = (str: string, patterns: Array<GlobPattern>): boolean => {
  return patterns.some((it) => match(str, it))
}
