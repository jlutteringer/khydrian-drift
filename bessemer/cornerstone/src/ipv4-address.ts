import Zod from 'zod'
import { NominalType } from '@bessemer/cornerstone/types'
import { failure, Result, success } from '@bessemer/cornerstone/result'
import { createNamespace } from '@bessemer/cornerstone/resource-key'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'

export const Namespace = createNamespace('ipv4-address')
export type IpV4Address = NominalType<string, typeof Namespace>

const regex = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]\d|\d)){3}$/

export const parseString = (value: string): Result<IpV4Address, ErrorEvent> => {
  if (!regex.test(value)) {
    return failure(
      invalidValue(value, {
        namespace: Namespace,
        message: `[${Namespace}]: Invalid characters for IpV4Address in string: [${value}]`,
      })
    )
  }

  return success(value as IpV4Address)
}

export const fromString = (value: string): IpV4Address => {
  return unpackResult(parseString(value))
}

export const Schema = structuredTransform(Zod.string(), parseString)
