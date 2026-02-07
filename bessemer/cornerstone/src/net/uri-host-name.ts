import Zod from 'zod'
import { createNamespace } from '@bessemer/cornerstone/resource-key'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'
import { DomainName, parseString as parseDomainName } from '@bessemer/cornerstone/net/domain-name'
import { IpV4Address, parseString as parseIpV4Address } from '@bessemer/cornerstone/net/ipv4-address'
import { IpV6Address, parseString as parseIpV6Address } from '@bessemer/cornerstone/net/ipv6-address'
import * as Strings from '@bessemer/cornerstone/string'
import * as Results from '@bessemer/cornerstone/result'
import { Result } from '@bessemer/cornerstone/result'

export const Namespace = createNamespace('uri-host-name')
export type UriHostName = DomainName | IpV4Address | `[${IpV6Address}]`

export const parseString = (value: string): Result<UriHostName, ErrorEvent> => {
  if (value.startsWith('[') && value.endsWith(']')) {
    const ipV6Address = parseIpV6Address(Strings.removeEnd(Strings.removeStart(value, '['), ']'))
    if (Results.isSuccess(ipV6Address)) {
      return Results.success(`[${ipV6Address}]` as UriHostName)
    }
  }

  const domainName = parseDomainName(value)
  if (Results.isSuccess(domainName)) {
    return domainName
  }
  const ipV4Address = parseIpV4Address(value)
  if (Results.isSuccess(ipV4Address)) {
    return ipV4Address
  }

  return Results.failure(
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
