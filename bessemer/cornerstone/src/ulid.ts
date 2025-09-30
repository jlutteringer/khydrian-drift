import { ulid } from 'ulid'
import { NominalType } from '@bessemer/cornerstone/types'
import Zod from 'zod'
import { failure, Result, success } from '@bessemer/cornerstone/result'
import { namespace } from '@bessemer/cornerstone/resource-key'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'

export const Namespace = namespace('ulid')
export type Ulid = NominalType<string, typeof Namespace>

export const parseString = (value: string): Result<Ulid, ErrorEvent> => {
  if (!/^[0-9A-HJKMNP-TV-Z]{26}$/.test(value)) {
    return failure(invalidValue(value, { namespace: Namespace, message: `Invalid ULID format.` }))
  }

  return success(value as Ulid)
}

export const fromString = (value: string): Ulid => {
  return unpackResult(parseString(value))
}

export const Schema = structuredTransform(Zod.string(), parseString)

export const generate = (): Ulid => {
  return ulid() as Ulid
}
