import { isEmpty as _isEmpty, isString as _isString, startsWith as _startsWith } from 'lodash-es'

export const isString = (value?: any): value is string => {
  return _isString(value)
}

export const isEmpty = _isEmpty

/**
 * Splits a string on the first value of splitString and returns [first, rest]
 */
export const splitFirst = (str: string, splitString: string) => {
  const results = str.split(splitString)
  if (results.length === 1) {
    return results
  }

  return [results[0], results.slice(1).join(splitString)] as const
}

/**
 * Splits a string on the last value of splitString and returns [rest, last]
 */
export const splitLast = (str: string, splitString: string) => {
  const results = str.split(splitString)
  if (results.length === 1) {
    return results
  }

  return [results.slice(0, results.length - 1).join(splitString), results[results.length - 1]] as const
}

/**
 * Splits a string at a given index and returns both parts
 */
export const splitAt = (str: string, index: number) => {
  return [str.slice(0, index), str.slice(index)] as const
}

export const startsWith = _startsWith

export const removeStart = (string: string, substring: string) => {
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

export const isBlank = (str?: string | null) => {
  const testStr = str ?? ''
  return /^\s*$/.test(testStr)
}

/**
 * Converts a given string into a URL-friendly slug.
 *
 * The function performs the following transformations:
 * - Converts German umlauts (ä, ö, ü) to their respective digraphs (ae, oe, ue).
 * - Converts the German sharp S (ß) to 'ss'.
 * - Trims leading and trailing whitespace.
 * - Converts the string to lowercase.
 * - Removes any non-alphanumeric characters, including spaces.
 * - Collapses consecutive hyphens into a single hyphen.
 *
 * Modified from: https://dev.to/bybydev/how-to-slugify-a-string-in-javascript-4o9n
 *
 * @param str - The input string to be slugified.
 * @param maxChars - Maximum number of characters for the slug. Defaults to 32
 * @returns The slugified version of the input string.
 */
export const slugify = (str: string, maxChars: number = 32) => {
  return str
    .replace(/[Ää]/g, 'ae') // convert ä to ae
    .replace(/[Öö]/g, 'oe') // convert ö to oe
    .replace(/[Üü]/g, 'ue') // convert ü to ue
    .replace(/ß/g, 'ss') // convert ß to ss
    .trim() // trim leading/trailing white space
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // remove any non-alphanumeric characters
    .replace(/\s+/g, '-') // replace spaces with hyphens
    .replace(/-+/g, '-') // remove consecutive hyphens
    .slice(0, maxChars)
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

  let closestIndex = occurrences[0]
  let minDistance = Math.abs(center - closestIndex)

  for (let i = 1; i < occurrences.length; i++) {
    const distance = Math.abs(center - occurrences[i])
    if (distance < minDistance) {
      minDistance = distance
      closestIndex = occurrences[i]
    }
  }

  return closestIndex
}