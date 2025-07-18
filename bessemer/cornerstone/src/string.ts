import {
  endsWith as _endsWith,
  includes as _includes,
  isEmpty as _isEmpty,
  padEnd as _padEnd,
  padStart as _padStart,
  replace as _replace,
  startsWith as _startsWith,
} from 'lodash-es'
import { UnknownRecord } from 'type-fest'
import { rest } from '@bessemer/cornerstone/array'

export const isString = (value?: any): value is string => {
  return typeof value === 'string'
}

export const isEmpty = _isEmpty

export type StringSplitResult = { selection: string; separator: string; rest: string } | { selection: null; separator: null; rest: string }

export const splitFirst = (str: string, splitter: string | RegExp): StringSplitResult => {
  if (isString(splitter)) {
    const results = str.split(splitter)
    if (results.length === 1) {
      return { selection: null, separator: null, rest: str }
    }

    return { selection: results[0]!, separator: splitter, rest: rest(results).join(splitter) }
  } else {
    const match = splitter.exec(str)

    if (!match) {
      return { selection: null, separator: null, rest: str }
    }

    const matchIndex = match.index
    const beforeMatch = str.slice(0, matchIndex)
    const afterMatch = str.slice(matchIndex + match[0].length)
    const separator = match[0]
    return { selection: beforeMatch, separator, rest: afterMatch }
  }
}

export const splitLast = (str: string, splitter: string | RegExp): StringSplitResult => {
  if (isString(splitter)) {
    const results = str.split(splitter)
    if (results.length === 1) {
      return { selection: null, separator: null, rest: str }
    }

    return { selection: results[results.length - 1]!, separator: splitter, rest: results.slice(0, results.length - 1).join(splitter) }
  } else {
    if (!splitter.global) {
      splitter = new RegExp(splitter.source, splitter.flags + 'g')
    }

    const matches = Array.from(str.matchAll(splitter))

    if (matches.length === 0) {
      return { selection: null, separator: null, rest: str }
    }

    // Use the last match
    const lastMatch = matches[matches.length - 1]!
    const matchIndex = lastMatch.index!
    const separator = lastMatch[0]!
    const beforeMatch = str.slice(0, matchIndex)
    const afterMatch = str.slice(matchIndex + separator.length)

    return {
      selection: afterMatch,
      separator: separator,
      rest: beforeMatch,
    }
  }
}

export const splitLastRegex = (str: string, regex: RegExp): StringSplitResult => {
  // Find the last match using regex lastIndex
  let lastMatch: RegExpExecArray | null = null
  let match

  while ((match = regex.exec(str)) !== null) {
    lastMatch = match
  }

  if (!lastMatch) {
    return { selection: null, separator: null, rest: str }
  }

  const matchIndex = lastMatch.index!
  const separator = lastMatch[0]
  const beforeMatch = str.slice(0, matchIndex)
  const afterMatch = str.slice(matchIndex + separator.length)

  return {
    selection: afterMatch,
    separator,
    rest: beforeMatch,
  }
}

export const splitAt = (str: string, index: number): [string, string] => {
  return [str.slice(0, index), str.slice(index)] as const
}

export const startsWith = _startsWith
export const endsWith = _endsWith

export const removeStart = (string: string, substring: string): string => {
  if (!string.startsWith(substring)) {
    return string
  }

  return string.slice(substring.length)
}

export const removeEnd = (string: string, substring: string): string => {
  if (!string.endsWith(substring)) {
    return string
  }

  return string.slice(0, -substring.length)
}

export const isBlank = (str?: string | null): boolean => {
  const testStr = str ?? ''
  return /^\s*$/.test(testStr)
}

export const mostCentralOccurrence = (str: string, substr: string): number | null => {
  const occurrences: number[] = []
  let index = str.indexOf(substr)

  while (index !== -1) {
    occurrences.push(index)
    index = str.indexOf(substr, index + 1)
  }

  if (occurrences.length === 0) {
    return null
  }

  const center = str.length / 2

  let closestIndex = occurrences[0]!
  let minDistance = Math.abs(center - closestIndex)

  for (let i = 1; i < occurrences.length; i++) {
    const distance = Math.abs(center - occurrences[i]!)
    if (distance < minDistance) {
      minDistance = distance
      closestIndex = occurrences[i]!
    }
  }

  return closestIndex
}

export const replacePlaceholders = (string: string, parameters: UnknownRecord, getParamPlaceholder = (paramName: string) => `{{${paramName}}}`) => {
  return Object.entries(parameters).reduce(
    (intermediateString, [paramName, paramValue]) => intermediateString.replaceAll(getParamPlaceholder(paramName), `${paramValue}`),
    string
  )
}

export const padStart = _padStart
export const padEnd = _padEnd

export const contains = _includes

export const replace = _replace
