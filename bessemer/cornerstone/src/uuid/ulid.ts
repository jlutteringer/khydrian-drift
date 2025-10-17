import { ulid } from 'ulid'
import { NominalType } from '@bessemer/cornerstone/types'
import Zod from 'zod'
import { failure, Result, success } from '@bessemer/cornerstone/result'
import { createNamespace } from '@bessemer/cornerstone/resource-key'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'

export const Namespace = createNamespace('ulid')
export type Ulid = NominalType<string, typeof Namespace>

export const parse = (value: string): Result<Ulid, ErrorEvent> => {
  if (!/^[0-9A-HJKMNP-TV-Z]{26}$/i.test(value)) {
    return failure(invalidValue(value, { namespace: Namespace, message: `[${Namespace}]: Invalid Ulid format: [${value}]` }))
  }

  return success(value.toUpperCase() as Ulid)
}

export const from = (value: string): Ulid => {
  return unpackResult(parse(value))
}

export const Schema = structuredTransform(Zod.string(), parse)

export const generate = (): Ulid => {
  return ulid() as Ulid
}
