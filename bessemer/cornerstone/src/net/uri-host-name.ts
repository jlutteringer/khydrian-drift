import Zod from 'zod'
import { failure, Result, success } from '@bessemer/cornerstone/result'
import { createNamespace } from '@bessemer/cornerstone/resource-key'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'
import { DomainName, parseString as parseDomainName } from '@bessemer/cornerstone/net/domain-name'
import { IpV4Address, parseString as parseIpV4Address } from '@bessemer/cornerstone/net/ipv4-address'
import { IpV6Address, parseString as parseIpV6Address } from '@bessemer/cornerstone/net/ipv6-address'
import * as Strings from '@bessemer/cornerstone/string'

export const Namespace = createNamespace('uri-host-name')
export type UriHostName = DomainName | IpV4Address | `[${IpV6Address}]`

export const parseString = (value: string): Result<UriHostName, ErrorEvent> => {
  if (value.startsWith('[') && value.endsWith(']')) {
    const ipV6Address = parseIpV6Address(Strings.removeEnd(Strings.removeStart(value, '['), ']'))
    if (ipV6Address.isSuccess) {
      return success(`[${ipV6Address.value}]` as UriHostName)
    }
  }

  const domainName = parseDomainName(value)
  if (domainName.isSuccess) {
    return domainName
  }
  const ipV4Address = parseIpV4Address(value)
  if (ipV4Address.isSuccess) {
    return ipV4Address
  }

  return failure(
    invalidValue(value, {
      namespace: Namespace,
      message: `[${Namespace}]: Invalid characters for UriHostName in string: [${value}]`,
    })
  )
}

export const from = (value: string): UriHostName => {
  return unpackResult(parseString(value))
}

export const Schema = structuredTransform(Zod.string(), parseString)
