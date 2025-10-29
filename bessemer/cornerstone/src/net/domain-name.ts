import Zod from 'zod'
import { NominalType } from '@bessemer/cornerstone/types'
import { failure, Result, success } from '@bessemer/cornerstone/result'
import { createNamespace } from '@bessemer/cornerstone/resource-key'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'

export const Namespace = createNamespace('domain-name')
export type DomainName = NominalType<string, typeof Namespace>

const regex =
  /^[a-zA-Z0-9\u00a1-\uffff](?:[a-zA-Z0-9\u00a1-\uffff-]{0,61}[a-zA-Z0-9\u00a1-\uffff])?(?:\.[a-zA-Z0-9\u00a1-\uffff](?:[a-zA-Z0-9\u00a1-\uffff-]{0,61}[a-zA-Z0-9\u00a1-\uffff])?)*$/

export const parseString = (value: string): Result<DomainName, ErrorEvent> => {
  if (!regex.test(value)) {
    return failure(
      invalidValue(value, {
        namespace: Namespace,
        message: `[${Namespace}]: Invalid characters for DomainName in string: [${value}]`,
      })
    )
  }

  return success(value as DomainName)
}

export const from = (value: string): DomainName => {
  return unpackResult(parseString(value))
}

export const Schema = structuredTransform(Zod.string(), parseString)
