import { isNumber as _isNumber } from 'lodash-es'

export const isNumber = (value?: unknown): value is number => {
  if (isNaN(value as any)) {
    return false
  }
  return _isNumber(value)
}

export const isPositive = (value?: unknown): value is number => {
  return isNumber(value) && value > 0
}

export const isEven = (d: number) => d % 2 === 0

export enum RoundingMode {
  Nearest = 'Nearest',
  Down = 'Down',
  Up = 'Up',
  HalfEven = 'HalfEven',
}

export const round = (value: number, scale: number, roundingMode: RoundingMode): number => {
  switch (roundingMode) {
    case RoundingMode.Nearest:
      return roundNearest(value, scale)
    case RoundingMode.Down:
      return roundDown(value, scale)
    case RoundingMode.Up:
      return roundUp(value, scale)
    case RoundingMode.HalfEven:
      return roundHalfEven(value, scale)
  }
}

export const roundNearest = (value: number, scale: number): number => {
  const factor = Math.pow(10, scale)
  return Math.round((value + Number.EPSILON) * factor) / factor
}

export const roundDown = (value: number, scale: number) => {
  const factor = Math.pow(10, scale)
  return Math.floor((value + +Number.EPSILON) * factor) / factor
}

export const roundUp = (value: number, scale: number) => {
  const factor = Math.pow(10, scale)
  return Math.ceil((value + +Number.EPSILON) * factor) / factor
}

/**
 * Round Half-Even (Banker's Rounding) Utility
 * https://en.wikipedia.org/wiki/Rounding#Round_half_to_even
 *
 * Mostly copied from this Github: https://github.com/schowdhuri/round-half-even
 */
export const roundHalfEven = (value: number, scale: number): number => {
  if (value < 0) {
    return -roundHalfEven(-value, scale)
  }
  if (scale === 0) {
    return roundHalfEven(value / 10, 1) * 10
  }

  const MAX_DECIMALS_ALLOWED = 20
  if (scale > MAX_DECIMALS_ALLOWED) {
    throw new Error(`Cannot handle more than ${MAX_DECIMALS_ALLOWED} decimals`)
  }

  // convert to string; remove trailing 0s
  const isExponentialForm = value.toString().includes('e') || value.toString().includes('E')
  const strNum = (isExponentialForm ? value.toFixed(MAX_DECIMALS_ALLOWED).toString() : value.toString()).replace(/0+$/, '')
  const decimalIndex = strNum.indexOf('.')
  if (decimalIndex < 0) {
    // no fractional part
    return value
  }
  let intPart: string = strNum.slice(0, decimalIndex)
  if (intPart.length == 0) {
    intPart = '0'
  }
  let fractPart = strNum.slice(decimalIndex + 1) // extract fractional part
  if (fractPart.length < scale) {
    return value
  }
  const followingDig = parseInt(fractPart[scale]!, 10)
  if (followingDig < 5) {
    // rounding not required
    const newFractPart = fractPart.slice(0, scale)
    return parseFloat(`${intPart}.${newFractPart}`)
  }
  if (followingDig === 5) {
    const newFractPart = fractPart.slice(0, scale + 1)
    if (parseInt(fractPart.slice(scale + 1), 10) > 0) {
      fractPart = `${newFractPart}9`
    } else {
      fractPart = newFractPart
    }
  }

  let nextDig = parseInt(fractPart[fractPart.length - 1]!, 10)
  let carriedOver = 0
  for (let ptr = fractPart.length - 1; ptr >= scale; ptr--) {
    let dig = parseInt(fractPart[ptr - 1]!, 10) + carriedOver
    if (nextDig > 5 || (nextDig == 5 && !isEven(dig))) {
      ++dig
    }
    if (dig > 9) {
      dig -= 10
      carriedOver = 1
    } else {
      carriedOver = 0
    }
    nextDig = dig
  }

  let newFractPart = ''
  for (let ptr = scale - 2; ptr >= 0; ptr--) {
    let d = parseInt(fractPart[ptr]!, 10) + carriedOver
    if (d > 9) {
      d -= 10
      carriedOver = 1
    } else {
      carriedOver = 0
    }
    newFractPart = `${d}${newFractPart}`
  }

  const resolvedIntPart = parseInt(intPart, 10) + carriedOver
  return parseFloat(`${resolvedIntPart}.${newFractPart}${nextDig}`)
}

export const random = (min: number, max: number): number => {
  return Math.random() * (max - min) + min
}

export const greatestCommonFactor = (first: number, second: number): number => {
  return second === 0 ? first : greatestCommonFactor(second, first % second)
}
