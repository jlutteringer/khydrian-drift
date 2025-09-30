import { NominalType } from '@bessemer/cornerstone/types'
import Zod from 'zod'
import { isNil } from '@bessemer/cornerstone/object'
import { padStart } from '@bessemer/cornerstone/string'
import { failure, Result, success } from '@bessemer/cornerstone/result'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { namespace } from '@bessemer/cornerstone/resource-key'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'

export const Namespace = namespace('uuid')
export type Uuid = NominalType<string, typeof Namespace>

export const parseString = (value: string): Result<Uuid, ErrorEvent> => {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    return failure(invalidValue(value, { namespace: Namespace, message: `Invalid Uuid format.` }))
  }

  return success(value.toLowerCase() as Uuid)
}

export const fromString = (value: string): Uuid => {
  return unpackResult(parseString(value))
}

export const Schema = structuredTransform(Zod.string(), parseString)

export const generate = (): Uuid => {
  if (isNil(crypto.randomUUID)) {
    return `${randomHex(8)}-${randomHex(4)}-${randomHex(4)}-${randomHex(4)}-${randomHex(12)}` as Uuid
  } else {
    return crypto.randomUUID() as Uuid
  }
}

const randomHex = (characters: number) => {
  // Generates a random number between 0x0..0 and 0xF..F for the target number of characters
  const randomNum = Math.floor(Math.random() * (16 ** characters - 1))
  return padStart(randomNum.toString(16), characters, '0')
}
