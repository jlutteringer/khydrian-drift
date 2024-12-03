import { isNumber as _isNumber } from 'lodash-es'

// Checks to see if the value is actually a number, does not perform any type coercion
export const isNumber = (value?: unknown): value is number => {
  return _isNumber(value)
}

export const isPositive = (value?: unknown): value is number => {
  return isNumber(value) && value > 0
}

/**
 * Rounds `value` to the number of decimal places specified.
 * This is a convenience wrapper around Math.round which handles rounding to a specific decimal places
 */
export const round = (value: number, decimalPlaces: number = 2): number => {
  const multiplier = Math.pow(10, decimalPlaces)
  return Math.round((value + Number.EPSILON) * multiplier) / multiplier
}
