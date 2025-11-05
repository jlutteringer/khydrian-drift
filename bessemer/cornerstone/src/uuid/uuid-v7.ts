import { NominalType } from '@bessemer/cornerstone/types'
import Zod from 'zod'
import * as Results from '@bessemer/cornerstone/result'
import { Result } from '@bessemer/cornerstone/result'
import * as ErrorEvents from '@bessemer/cornerstone/error/error-event'
import { ErrorEvent } from '@bessemer/cornerstone/error/error-event'
import * as ResourceKeys from '@bessemer/cornerstone/resource-key'
import * as ZodUtil from '@bessemer/cornerstone/zod-util'
import * as Clocks from '@bessemer/cornerstone/temporal/clock'
import * as Instants from '@bessemer/cornerstone/temporal/instant'
import * as Strings from '@bessemer/cornerstone/string'

export const Namespace = ResourceKeys.createNamespace('uuid-v7')
export type UuidV7 = NominalType<string, typeof Namespace>

export const parse = (value: string): Result<UuidV7, ErrorEvent> => {
  if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(value)) {
    return Results.failure(ErrorEvents.invalidValue(value, { namespace: Namespace, message: `[${Namespace}]: Invalid UuidV7 format: [${value}]` }))
  }

  return Results.success(value.toLowerCase() as UuidV7)
}

export const from = (value: string): UuidV7 => {
  return ErrorEvents.unpackResult(parse(value))
}

export const Schema = ZodUtil.structuredTransform(Zod.string(), parse).meta({
  type: 'string',
  format: 'uuid',
  pattern: '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$',
})

export const generate = (clock = Clocks.Default): UuidV7 => {
  const timestamp = Instants.now(clock).epochMilliseconds

  // Convert timestamp to 48-bit (12 hex characters)
  const timestampHex = Strings.padStart(timestamp.toString(16), 12, '0')

  // Generate 12 bits of random data for sub-millisecond precision
  const randomA = Math.floor(Math.random() * 0x1000) // 12 bits

  // Set version (7) in the most significant 4 bits
  const versionAndRandom = 0x7000 | randomA
  const versionAndRandomHex = Strings.padStart(versionAndRandom.toString(16), 4, '0')

  // Generate 14 bits of random data for clock sequence
  const clockSeq = Math.floor(Math.random() * 0x4000) // 14 bits

  // Set variant bits (10xx) in the most significant 2 bits
  const variantAndClockSeq = 0x8000 | clockSeq
  const variantAndClockSeqHex = Strings.padStart(variantAndClockSeq.toString(16), 4, '0')

  // Generate 48 bits (12 hex characters) of random data for node
  const nodeHex = randomHex(12)

  // Format as UUID: xxxxxxxx-xxxx-7xxx-xxxx-xxxxxxxxxxxx
  return `${timestampHex.slice(0, 8)}-${timestampHex.slice(8, 12)}-${versionAndRandomHex}-${variantAndClockSeqHex}-${nodeHex}` as UuidV7
}

const randomHex = (characters: number) => {
  // Generates a random number between 0x0..0 and 0xF..F for the target number of characters
  const randomNum = Math.floor(Math.random() * (16 ** characters - 1))
  return Strings.padStart(randomNum.toString(16), characters, '0')
}
