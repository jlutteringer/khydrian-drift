import { NominalType, TaggedType } from '@bessemer/cornerstone/types'
import * as Strings from '@bessemer/cornerstone/string'
import { StringSplitResult } from '@bessemer/cornerstone/string'
import * as Objects from '@bessemer/cornerstone/object'
import * as Arrays from '@bessemer/cornerstone/array'
import * as ResourceKeys from '@bessemer/cornerstone/resource-key'
import * as Results from '@bessemer/cornerstone/result'
import { Result } from '@bessemer/cornerstone/result'
import * as ErrorEvents from '@bessemer/cornerstone/error/error-event'
import { ErrorEvent } from '@bessemer/cornerstone/error/error-event'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'
import Zod from 'zod'

export const encode = (uriComponent: UriComponent) => {
  return encodeURIComponent(uriComponent)
}

export const decode = (uriComponent: UriComponent) => {
  return decodeURIComponent(uriComponent)
}

export type UriString = TaggedType<string, 'UriString'>
export type UriComponent = string

export type UriScheme = string

export type UriAuthentication = {
  principal: string
  password: string | null
}

export type UriHost = {
  value: string
  port: number | null
}

export interface UriLocation {
  path: string | null
  query: string | null
  fragment: string | null
}

export const Namespace = ResourceKeys.createNamespace('uri')
export const UrlNamespace = ResourceKeys.createNamespace('url')

export interface Uri {
  _type: typeof Namespace
  scheme: UriScheme | null
  host: UriHost | null
  authentication: UriAuthentication | null
  location: UriLocation
}

export type UriLiteral = NominalType<string, typeof Namespace>

type UriBuilderLocation =
  | {
      path?: string | null
      query?: string | null
      fragment?: string | null
    }
  | string

type UriBuilderHost =
  | {
      value: string
      port?: number | null
    }
  | string

type UriBuilderAuthentication =
  | {
      principal: string
      password?: string | null
    }
  | string

export type UriBuilder = {
  scheme?: string | null | undefined
  location?: UriBuilderLocation | null | undefined
  host?: UriBuilderHost | null | undefined
  authentication?: UriBuilderAuthentication | null | undefined
}

export type UriLike = Uri | UriLiteral | UriBuilder

export const parseString = (value: string): Result<Uri, ErrorEvent> => {
  const schemeResult = parseSchemePart(value)
  if (!schemeResult.isSuccess) {
    return Results.failure(ErrorEvents.invalidValue(value, { namespace: Namespace, causes: schemeResult.value.causes }))
  }

  const [scheme, rest1] = schemeResult.value

  const authenticationPartResult = parseAuthenticationPart(rest1)
  if (!authenticationPartResult.isSuccess) {
    return authenticationPartResult
  }
  const [authentication, rest2] = authenticationPartResult.value

  const hostPartResult = parseHostPart(rest2)
  if (!hostPartResult.isSuccess) {
    return hostPartResult
  }
  const [host, rest3] = hostPartResult.value

  const location = parseLocation(rest3)
  const uri: Uri = { _type: Namespace, scheme, host, authentication, location }
  return Results.success(uri)
}

export const fromString = (value: string): Uri => {
  return ErrorEvents.unpackResult(parseString(value))
}

export function from(value: UriLike): Uri
export function from(value: UriLike | null): Uri | null
export function from(value: UriLike | undefined): Uri | undefined
export function from(value: UriLike | null | undefined): Uri | null | undefined
export function from(value: UriLike | null | undefined): Uri | null | undefined {
  if (Objects.isNil(value)) {
    return value
  }
  if (isUri(value)) {
    return value
  }
  if (Strings.isString(value)) {
    return fromString(value)
  }

  return build(value as UriBuilder)
}

export function toLiteral(likeValue: UriLike): UriLiteral
export function toLiteral(likeValue: UriLike | null): UriLiteral | null
export function toLiteral(likeValue: UriLike | undefined): UriLiteral | undefined
export function toLiteral(likeValue: UriLike | null | undefined): UriLiteral | null | undefined
export function toLiteral(likeValue: UriLike | null | undefined): UriLiteral | null | undefined {
  if (Objects.isNil(likeValue)) {
    return likeValue
  }

  const value = from(likeValue)
  return format(value) as UriLiteral
}

export const SchemaLiteral = structuredTransform(Zod.string(), (it: string) => Results.mapResult(parseString(it), (it) => toLiteral(it)))
// JOHN need a schema for the object version...
// export const SchemaInstance = structuredTransform(Zod.string(), parseString)

export const isUri = (value: unknown): value is Uri => {
  if (!Objects.isObject(value)) {
    return false
  }

  const uriValue = value as any as Uri
  return uriValue._type === Namespace || uriValue._type === UrlNamespace
}

export const merge = (element: UriLike, builder: Partial<UriBuilder>): Uri => {
  const uri = from(element)

  const uriBuilder: UriBuilder = {
    scheme: uri.scheme,
    host: uri.host,
    authentication: uri.authentication,
    location: uri.location,
  }

  const mergedBuilder = Objects.deepMerge(uriBuilder, builder)
  return from(mergedBuilder)
}

const parseSchemePart = (url: UriComponent): Result<[UriScheme | null, UriComponent], ErrorEvent> => {
  // Search for the colon or double slash
  const schemeMatch = Strings.splitFirst(url, /(\/\/|:)/)

  // If we don't find either, or we hit the double slash before finding a colon, there is no scheme
  if (Objects.isNil(schemeMatch.selection) || schemeMatch.separator === '//') {
    return Results.success([null, url])
  }

  // This means the string started with :, so no protocol. We'll go ahead and remove the : from consideration
  if (Strings.isEmpty(schemeMatch.selection)) {
    return Results.success([null, schemeMatch.rest])
  } else {
    const schemeResult = parseScheme(schemeMatch.selection)
    if (!schemeResult.isSuccess) {
      return schemeResult
    }

    return Results.success([schemeResult.value, schemeMatch.rest])
  }
}

const parseScheme = (scheme: UriComponent): Result<UriScheme, ErrorEvent> => {
  // RFC 3986: scheme = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
  const schemeRegex = /^[a-zA-Z][a-zA-Z0-9+.-]*$/
  if (!schemeRegex.test(scheme)) {
    return Results.failure(
      ErrorEvents.invalidValue(scheme, {
        namespace: Namespace,
        message: `Uri - Invalid characters in Scheme.`,
      })
    )
  }

  return Results.success(scheme)
}

const parseAuthenticationPart = (url: UriComponent): Result<[UriAuthentication | null, UriComponent], ErrorEvent> => {
  let targetPart = url
  const queryMatch = Strings.splitFirst(targetPart, '?')
  const fragmentMatch = Strings.splitFirst(targetPart, '#')
  if (Objects.isPresent(queryMatch.selection)) {
    targetPart = queryMatch.selection
  } else if (Objects.isPresent(fragmentMatch.selection)) {
    targetPart = fragmentMatch.selection
  }

  const { selection: authentication } = Strings.splitFirst(targetPart, '@')

  // If there is no @, then we don't have an authentication
  if (Objects.isNil(authentication)) {
    return Results.success([null, url])
  }

  const { rest } = Strings.splitFirst(url, '@')

  const authenticationParseResult = parseAuthentication(Strings.removeStart(authentication, '//'))
  if (!authenticationParseResult.isSuccess) {
    return authenticationParseResult
  }

  return Results.success([authenticationParseResult.value, '//' + rest])
}

const parseAuthentication = (authentication: UriComponent): Result<UriAuthentication, ErrorEvent> => {
  const { selection: principal, rest: authenticationRest } = Strings.splitFirst(authentication, ':')

  // If there isn't a colon, then there is no password but there is a username
  if (Objects.isNil(principal)) {
    return Results.success({ principal: authenticationRest, password: null })
  }

  // The authentication section started with a :, don't know what to make of this... password but no username?
  if (Strings.isEmpty(principal)) {
    return Results.failure(
      ErrorEvents.invalidValue(authentication, {
        namespace: Namespace,
        message: `Uri - Unable to parse UriAuthentication from authentication string.`,
      })
    )
  }

  // Otherwise, we have both, so return the complete authentication object and the rest
  return Results.success({ principal, password: authenticationRest })
}

const parseHostPart = (url: UriComponent): Result<[UriHost | null, UriComponent], ErrorEvent> => {
  // Check if the host is starting with reserved characters, if so we should just bail on trying to parse
  if (url.startsWith('?') || url.startsWith('#')) {
    return Results.success([null, url])
  }

  let hostRequired = url.startsWith('//')
  if (!hostRequired) {
    return Results.success([null, url])
  }

  url = Strings.removeStart(url, '//')

  // Lets grab everything to the left of the first / ? or #, this is the remainder of our authority (if any)
  const urlMatch = Strings.splitFirst(url, /[\/?#]/)
  let host = urlMatch.rest
  let rest = ''

  if (Objects.isPresent(urlMatch.selection)) {
    host = urlMatch.selection
    rest = urlMatch.separator + urlMatch.rest
  }

  if (Strings.isEmpty(host)) {
    return Results.success([null, rest])
  }

  const parseHostResult = parseHost(host)
  if (!parseHostResult.isSuccess) {
    return parseHostResult
  }

  return Results.success([parseHostResult.value, rest])
}

const parseHost = (host: UriComponent): Result<UriHost, ErrorEvent> => {
  // Try to see if we have an ipv6 address like the form [2001:db8::7] and handle it
  if (host.startsWith('[')) {
    const ipMatch = Strings.splitFirst(host, ']')

    if (Objects.isPresent(ipMatch.selection)) {
      const portMatch = Strings.splitFirst(ipMatch.rest, ':')
      if (Objects.isPresent(portMatch.selection) && Strings.isEmpty(portMatch.selection)) {
        if (!Strings.isNumber(portMatch.rest)) {
          return Results.failure(ErrorEvents.invalidValue(host, { namespace: Namespace, message: `Unable to parse Host` }))
        }

        return Results.success({ value: ipMatch.selection + ']', port: Number(portMatch.rest) })
      } else {
        return Results.success({ value: ipMatch.selection + ']', port: null })
      }
    }
  }

  let hostMatch: StringSplitResult = Strings.splitFirst(host, ':')

  // We have no :, which means no port, so treat the rest as the hostname
  if (Objects.isNil(hostMatch.selection)) {
    return Results.success({ value: hostMatch.rest, port: null })
  }

  // The host started with a :, this is odd
  if (Strings.isEmpty(hostMatch.selection)) {
    return Results.failure(ErrorEvents.invalidValue(host, { namespace: Namespace, message: `Unable to parse Host` }))
  }

  const hostName = hostMatch.selection

  if (!Strings.isNumber(hostMatch.rest)) {
    return Results.failure(ErrorEvents.invalidValue(host, { namespace: Namespace, message: `Unable to parse Host` }))
  }

  // Otherwise, we have both, so return the complete authentication object and the rest
  return Results.success({ value: hostName, port: Number(hostMatch.rest) })
}

const parseLocation = (url: UriComponent): UriLocation => {
  const location: UriLocation = { path: null, query: null, fragment: null }

  // Lets see if we have a fragment and parse it off the end
  const fragmentMatch = Strings.splitFirst(url, '#')
  if (Objects.isPresent(fragmentMatch.selection) && !Strings.isEmpty(fragmentMatch.rest)) {
    location.fragment = fragmentMatch.rest
  }

  // Lets see if we have a query string and parse it off the remainder
  const queryMatch = Strings.splitFirst(fragmentMatch.selection ?? fragmentMatch.rest, '?')
  if (Objects.isPresent(queryMatch.selection) && !Strings.isEmpty(queryMatch.rest)) {
    location.query = queryMatch.rest
  }

  location.path = Strings.emptyToNull(queryMatch.selection ?? queryMatch.rest)
  return location
}

const build = (builder: UriBuilder): Uri => {
  const scheme = Objects.isPresent(builder.scheme) ? ErrorEvents.unpackResult(parseScheme(builder.scheme)) : null
  let host: UriHost | null = null
  let authentication: UriAuthentication | null = null

  if (Objects.isPresent(builder.host)) {
    if (Strings.isString(builder.host)) {
      host = ErrorEvents.unpackResult(parseHost(builder.host))
    } else {
      host = {
        value: builder.host.value,
        port: builder.host.port ?? null,
      }
    }

    if (Objects.isPresent(builder.authentication)) {
      if (Strings.isString(builder.authentication)) {
        authentication = ErrorEvents.unpackResult(parseAuthentication(builder.authentication))
      } else {
        authentication = {
          principal: builder.authentication.principal,
          password: builder.authentication.password ?? null,
        }
      }
    }
  }

  let location: UriLocation = {
    path: null,
    query: null,
    fragment: null,
  }

  if (Objects.isPresent(builder.location)) {
    if (Strings.isString(builder.location)) {
      location = parseLocation(builder.location)
    } else {
      location = {
        path: builder.location.path ?? null,
        query: builder.location.query ?? null,
        fragment: builder.location.fragment ?? null,
      }
    }
  }

  return {
    _type: Namespace,
    scheme,
    host,
    authentication,
    location,
  }
}

export enum UriComponentType {
  Scheme = 'Scheme',
  Host = 'Host',
  Location = 'Location',
}

export const format = (uri: Uri, format: Array<UriComponentType> = Object.values(UriComponentType)): UriString => {
  let urlString = ''
  if (Objects.isPresent(uri.scheme) && Arrays.contains(format, UriComponentType.Scheme)) {
    urlString = urlString + uri.scheme
  }

  if (Objects.isPresent(uri.host) && Arrays.contains(format, UriComponentType.Host)) {
    if (Objects.isPresent(uri.scheme)) {
      urlString = urlString + '://'
    }

    if (Objects.isPresent(uri.authentication)) {
      urlString = urlString + uri.authentication.principal

      if (Objects.isPresent(uri.authentication.password)) {
        urlString = urlString + ':' + uri.authentication.password
      }

      urlString = urlString + '@'
    }

    urlString = urlString + uri.host.value

    if (Objects.isPresent(uri.host.port)) {
      urlString = urlString + ':' + uri.host.port
    }
  }

  if (Arrays.contains(format, UriComponentType.Location)) {
    urlString = urlString + formatLocation(uri.location)
  }

  return urlString
}

const formatLocation = (location: UriLocation): string => {
  let urlString = ''

  if (!Strings.isEmptyOrNil(location.path)) {
    urlString = urlString + location.path
  }

  if (!Strings.isEmptyOrNil(location.query)) {
    urlString = urlString + '?' + location.query
  }

  if (!Strings.isEmptyOrNil(location.fragment)) {
    urlString = urlString + '#' + encode(location.fragment!)
  }

  return urlString
}
