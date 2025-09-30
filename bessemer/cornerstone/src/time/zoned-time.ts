import { NominalType } from '@bessemer/cornerstone/types'
import Zod from 'zod'
import { failure, Result, success } from '@bessemer/cornerstone/result'
import { namespace } from '@bessemer/cornerstone/resource-key'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'

export const Namespace = namespace('zoned-time')
export type ZonedTime = NominalType<string, typeof Namespace>

export const parseString = (value: string): Result<ZonedTime, ErrorEvent> => {
  if (!/^\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) {
    return failure(invalidValue(value, { namespace: Namespace, message: `ZonedTime is invalid.` }))
  }

  return success(value as ZonedTime)
}

export const fromString = (value: string): ZonedTime => {
  return unpackResult(parseString(value))
}

export const Schema = structuredTransform(Zod.string(), parseString)
