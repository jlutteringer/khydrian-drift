import Zod from 'zod'
import { NominalType } from '@bessemer/cornerstone/types'
import { failure, Result, success } from '@bessemer/cornerstone/result'
import { createNamespace } from '@bessemer/cornerstone/resource-key'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'

export const Namespace = createNamespace('hex-code')
export type HexCode = NominalType<string, typeof Namespace>

export const parseString = (value: string): Result<HexCode, ErrorEvent> => {
  if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
    return failure(invalidValue(value, { namespace: Namespace, message: `HexCode must be a valid hex code (# followed by 3 or 6 characters).` }))
  }

  let normalizedValue = value.toUpperCase()

  if (normalizedValue.length === 4) {
    const shortHex = normalizedValue.slice(1) // Remove the #
    normalizedValue = `#${shortHex[0]}${shortHex[0]}${shortHex[1]}${shortHex[1]}${shortHex[2]}${shortHex[2]}`
  }

  return success(normalizedValue as HexCode)
}

export const from = (value: string): HexCode => {
  return unpackResult(parseString(value))
}

export const Schema = structuredTransform(Zod.string(), parseString)
