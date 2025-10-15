import { NominalType, TaggedType } from '@bessemer/cornerstone/types'
import * as Strings from '@bessemer/cornerstone/string'
import { StringSplitResult } from '@bessemer/cornerstone/string'
import * as Objects from '@bessemer/cornerstone/object'
import * as Arrays from '@bessemer/cornerstone/array'
import * as ResourceKeys from '@bessemer/cornerstone/resource-key'
import * as Results from '@bessemer/cornerstone/result'
import { Result, success } from '@bessemer/cornerstone/result'
import * as ErrorEvents from '@bessemer/cornerstone/error/error-event'
import { ErrorEvent } from '@bessemer/cornerstone/error/error-event'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'
import Zod from 'zod'
import * as IpV6Addresses from '@bessemer/cornerstone/ipv6-address'
import { PartialDeep, ValueOf } from 'type-fest'

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

/**
 * Parses a string into a Uri object, handling all URI components including scheme,
 * authority (host and authentication), and location (path, query, fragment).
 * Returns a Result containing either the parsed Uri or an ErrorEvent on failure.
 *
 * **Example**
 *
 * ```ts
 * import { Uris } from "@bessemer/cornerstone"
 *
 * // Parse a complete HTTPS URI
 * const result = Uris.parseString('https://user:pass@example.com:8080/api/v1?q=test#section')
 * if (result.isSuccess) {
 *   console.log(result.value.scheme) // 'https'
 *   console.log(result.value.host?.value) // 'example.com'
 *   console.log(result.value.authentication?.principal) // 'user'
 * }
 *
 * // Parse a simple URI without authority
 * const urnResult = Uris.parseString('urn:isbn:0451450523')
 * if (urnResult.isSuccess) {
 *   console.log(urnResult.value.scheme) // 'urn'
 *   console.log(urnResult.value.location.path) // 'isbn:0451450523'
 * }
 * ```
 *
 * @category parsing
 */
export const parseString = (value: string): Result<Uri, ErrorEvent> => {
  // JOHN we want to improve the syntax burden of handling a series of Result objects like this
  if (Strings.isBlank(value)) {
    return Results.failure(
      ErrorEvents.required({
        namespace: Namespace,
        message: `[${Namespace}]: Unable to parse Uri from empty string.`,
      })
    )
  }

  const schemeResult = parseSchemePart(value)
  if (!schemeResult.isSuccess) {
    return Results.failure(
      ErrorEvents.invalidValue(value, {
        namespace: Namespace,
        message: `[${Namespace}]: Unable to parse Uri from uri string: [${value}]`,
        causes: schemeResult.value.causes,
      })
    )
  }

  const [scheme, rest1] = schemeResult.value

  const authorityPartResult = parseAuthorityPart(rest1)
  if (!authorityPartResult.isSuccess) {
    return Results.failure(
      ErrorEvents.invalidValue(value, {
        namespace: Namespace,
        message: `[${Namespace}]: Unable to parse Uri from uri string: [${value}]`,
        causes: authorityPartResult.value.causes,
      })
    )
  }
  const [authority, rest2] = authorityPartResult.value

  const location = parseLocation(rest2)
  const uri: Uri = { _type: Namespace, scheme, host: authority.host, authentication: authority.authentication, location }
  return Results.success(uri)
}

/**
 * Parses a string into a Uri object, throwing an error if parsing fails.
 * This is a convenience method that wraps `parseString` and unwraps the Result,
 * converting any parsing errors into thrown exceptions.
 *
 * **Example**
 *
 * ```ts
 * import { Uris } from "@bessemer/cornerstone"
 *
 * // Parse a complete HTTPS URI
 * const uri = Uris.fromString('https://user:pass@example.com:8080/api/v1?q=test#section')
 * console.log(uri.scheme) // 'https'
 * console.log(uri.host?.value) // 'example.com'
 * console.log(uri.authentication?.principal) // 'user'
 *
 * // Parse a simple path-only URI
 * const pathUri = Uris.fromString('/api/users')
 * console.log(pathUri.location.path) // '/api/users'
 * ```
 *
 * @throws {ErrorEventException} When the input string cannot be parsed as a valid URI
 * @category parsing
 */
export const fromString = (value: string): Uri => {
  return ErrorEvents.unpackResult(parseString(value))
}

/**
 * Converts various URI-like inputs into a Uri object. Handles Uri instances,
 * string literals, and builder objects, returning them as-is when already a Uri
 * or converting them appropriately.
 *
 * **Example**
 *
 * ```ts
 * import { Uris } from "@bessemer/cornerstone"
 *
 * // String literal parsed into Uri
 * const fromString = Uris.from('https://api.example.com/v1' as UriLiteral)
 * console.log(fromString.scheme) // 'https'
 * console.log(fromString.host?.value) // 'api.example.com'
 *
 * // Builder object converted to Uri
 * const fromBuilder = Uris.from({
 *   scheme: 'https',
 *   host: { value: 'example.com', port: 8080 },
 *   location: { path: '/api' }
 * })
 * console.log(fromBuilder.host?.port) // 8080
 *
 * @category conversion
 */
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

/**
 * Converts various URI-like inputs into a normalized string literal representation.
 * Takes any URI-like value and returns its canonical string form
 *
 * **Example**
 *
 * ```ts
 * import { Uris } from "@bessemer/cornerstone"
 *
 * // Convert Uri instance to string literal
 * const uri = Uris.build({ scheme: 'https', host: 'example.com', location: { path: '/api' } })
 * const literal = Uris.toLiteral(uri)
 * console.log(literal) // "https://example.com/api"
 *
 * // Convert builder object to string literal
 * const fromBuilder = Uris.toLiteral({
 *   scheme: 'https',
 *   host: { value: 'api.example.com', port: 8080 },
 *   authentication: { principal: 'user', password: 'pass' },
 *   location: { path: '/v1', parameters: { q: 'search' } }
 * })
 * console.log(fromBuilder) // "https://user:pass@api.example.com:8080/v1?q=search"
 * ```
 *
 * @category serialization
 */
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

/**
 * Tests if the provided value is a Uri.
 *
 * **Example**
 *
 * ```ts
 * import { Uris } from "@bessemer/cornerstone"
 *
 * // Check if unknown value is a Uri
 * function processValue(value: unknown) {
 *   if (Uris.isUri(value)) {
 *     console.log(value.scheme) // Type-safe access
 *     console.log(value.location.path)
 *   }
 * }
 * ```
 *
 * @category type-guards
 */
export const isUri = (value: unknown): value is Uri => {
  if (!Objects.isObject(value)) {
    return false
  }

  const uriValue = value as any as Uri
  return uriValue._type === Namespace || uriValue._type === UrlNamespace
}

/**
 * Merges an existing URI with partial changes to create a new URI instance.
 * Allows selective updates without replacing the entire URI.
 *
 * **Example**
 *
 * ```ts
 * import { Uris } from "@bessemer/cornerstone"
 *
 * // Start with a base URI
 * const baseUri = Uris.build({
 *   scheme: 'https',
 *   host: { value: 'api.example.com', port: 443 },
 *   authentication: { principal: 'user', password: 'pass' },
 *   location: { path: '/v1', parameters: { format: 'json' } }
 * })
 *
 * // Change just the host and add query parameter
 * const updatedUri = Uris.merge(baseUri, {
 *   host: { value: 'api.production.com' }, // Port preserved from original
 *   location: {
 *     parameters: { version: '2.0' } // Merges with existing parameters
 *   }
 * })
 *
 * console.log(updatedUri.host?.value) // 'api.production.com'
 * console.log(updatedUri.host?.port) // 443 (preserved)
 * console.log(updatedUri.location.parameters) // { format: 'json', version: '2.0' }
 * ```
 *
 * @category transformation
 */
export const merge = (element: UriLike, builder: PartialDeep<UriBuilder>): Uri => {
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

  // This means the string started with :, so no protocol
  if (Strings.isEmpty(schemeMatch.selection)) {
    return Results.success([null, ':' + schemeMatch.rest])
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
        message: `[${Namespace}]: Invalid characters in Scheme.`,
      })
    )
  }

  return Results.success(scheme)
}

const parseAuthorityPart = (
  initialUrl: UriComponent
): Result<[{ host: UriHost | null; authentication: UriAuthentication | null }, UriComponent], ErrorEvent> => {
  if (!initialUrl.startsWith('//')) {
    return success([{ host: null, authentication: null }, initialUrl])
  }

  const url = Strings.removeStart(initialUrl, '//')

  const authenticationPartResult = parseAuthenticationPart(url)
  if (!authenticationPartResult.isSuccess) {
    return authenticationPartResult
  }
  const [authentication, rest1] = authenticationPartResult.value

  const hostPartResult = parseHostPart(rest1)
  if (!hostPartResult.isSuccess) {
    return hostPartResult
  }
  const [host, rest2] = hostPartResult.value

  return success([{ host, authentication }, rest2])
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

  const authenticationParseResult = parseAuthentication(authentication)
  if (!authenticationParseResult.isSuccess) {
    return authenticationParseResult
  }

  return Results.success([authenticationParseResult.value, rest])
}

const parseAuthentication = (authentication: UriComponent): Result<UriAuthentication, ErrorEvent> => {
  const { selection: principal, rest: authenticationRest } = Strings.splitFirst(authentication, ':')

  // If there isn't a colon, then there is no password but there is a username
  if (Objects.isNil(principal)) {
    if (!isAuthenticationComponentValid(authenticationRest)) {
      return Results.failure(
        ErrorEvents.invalidValue(authenticationRest, {
          namespace: Namespace,
          message: `[${Namespace}]: Invalid characters for UriAuthentication in principal string: [${authenticationRest}]`,
        })
      )
    }

    return Results.success({ principal: decode(authenticationRest), password: null })
  }

  // The authentication section started with a :, don't know what to make of this... password but no username?
  if (Strings.isEmpty(principal)) {
    return Results.failure(
      ErrorEvents.invalidValue(authentication, {
        namespace: Namespace,
        message: `[${Namespace}]: Unable to parse UriAuthentication from authentication string: [${authentication}]`,
      })
    )
  }

  if (!isAuthenticationComponentValid(principal)) {
    return Results.failure(
      ErrorEvents.invalidValue(principal, {
        namespace: Namespace,
        message: `[${Namespace}]: Invalid characters for UriAuthentication in principal string: [${principal}]`,
      })
    )
  }

  if (!isAuthenticationComponentValid(authenticationRest)) {
    return Results.failure(
      ErrorEvents.invalidValue(authenticationRest, {
        namespace: Namespace,
        message: `[${Namespace}]: Invalid characters for UriAuthentication in password string: [${authenticationRest}]`,
      })
    )
  }

  // Otherwise, we have both, so return the complete authentication object and the rest
  return Results.success({ principal: decode(principal), password: decode(authenticationRest) })
}

const isAuthenticationComponentValid = (component: UriComponent): boolean => {
  const userinfoRegex = /^[A-Za-z0-9\-._~!$&'()*+,;=%]*$/

  if (component.includes('%')) {
    const percentEncodingRegex = /%[0-9A-Fa-f]{2}/g
    const percentMatches = component.match(/%/g) || []
    const validEncodingMatches = component.match(percentEncodingRegex) || []

    if (percentMatches.length !== validEncodingMatches.length) {
      return false
    }
  }

  return userinfoRegex.test(component)
}

const parseHostPart = (url: UriComponent): Result<[UriHost | null, UriComponent], ErrorEvent> => {
  // Check if the host is starting with reserved characters, if so we should just bail on trying to parse
  if (url.startsWith('?') || url.startsWith('#')) {
    return Results.success([null, url])
  }

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
    const ipMatch = Strings.splitFirst(Strings.removeStart(host, '['), ']')

    if (Objects.isPresent(ipMatch.selection)) {
      const portMatch = Strings.splitFirst(ipMatch.rest, ':')

      const ipV6Result = IpV6Addresses.parseString(ipMatch.selection)
      if (!ipV6Result.isSuccess) {
        return ipV6Result
      }

      if (Objects.isPresent(portMatch.selection) && Strings.isEmpty(portMatch.selection)) {
        if (!Strings.isNumber(portMatch.rest)) {
          return Results.failure(ErrorEvents.invalidValue(host, { namespace: Namespace, message: `[${Namespace}]: Unable to parse Host: [${host}]` }))
        }

        return Results.success({ value: `[${ipMatch.selection}]`, port: Number(portMatch.rest) })
      } else {
        return Results.success({ value: `[${ipMatch.selection}]`, port: null })
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
    return Results.failure(
      ErrorEvents.invalidValue(host, { namespace: Namespace, message: `[${Namespace}]: Unable to parse Host from host string: [${host}]` })
    )
  }

  const hostName = hostMatch.selection

  if (!Strings.isNumber(hostMatch.rest)) {
    return Results.failure(
      ErrorEvents.invalidValue(host, { namespace: Namespace, message: `[${Namespace}]: Unable to parse Host from host string: [${host}]` })
    )
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

export const UriComponentType = {
  Scheme: 'Scheme',
  Authentication: 'Authentication',
  Host: 'Host',
  Location: 'Location',
  Path: 'Path',
  Query: 'Query',
  Fragment: 'Fragment',
} as const

export type UriComponentType = ValueOf<typeof UriComponentType>

/**
 * Converts a URI object into its string representation, with optional exclusion of specific URI components.
 *
 * **Example**
 *
 * ```ts
 * import { Uris, UriComponentType } from "@bessemer/cornerstone"
 *
 * const uri = Uris.build({
 *   scheme: 'https',
 *   authentication: { principal: 'user', password: 'secret' },
 *   host: { value: 'api.example.com', port: 8080 },
 *   location: { path: '/v1/data', parameters: { format: 'json' }, fragment: 'results' }
 * })
 *
 * // Format complete URI
 * const fullUri = Uris.format(uri)
 * console.log(fullUri) // "https://user:secret@api.example.com:8080/v1/data?format=json#results"
 *
 * // Exclude authentication for public sharing
 * const publicUri = Uris.format(uri, [UriComponentType.Authentication])
 * console.log(publicUri) // "https://api.example.com:8080/v1/data?format=json#results"
 *
 * // Format path-only URI
 * const pathOnly = Uris.format(uri, [
 *   UriComponentType.Scheme,
 *   UriComponentType.Host,
 *   UriComponentType.Authentication
 * ])
 * console.log(pathOnly) // "/v1/data?format=json#results"
 * ```
 *
 * @category serialization
 */
export const format = (uri: Uri, excludedUriComponents: Array<UriComponentType> = []): UriLiteral => {
  let urlString = ''
  if (Objects.isPresent(uri.scheme) && !Arrays.contains(excludedUriComponents, UriComponentType.Scheme)) {
    urlString = urlString + uri.scheme + ':'
  }

  if (Objects.isPresent(uri.host) && !Arrays.contains(excludedUriComponents, UriComponentType.Host)) {
    urlString = urlString + '//'

    if (Objects.isPresent(uri.authentication) && !Arrays.contains(excludedUriComponents, UriComponentType.Authentication)) {
      urlString = urlString + encode(uri.authentication.principal)

      if (Objects.isPresent(uri.authentication.password)) {
        urlString = urlString + ':' + encode(uri.authentication.password)
      }

      urlString = urlString + '@'
    }

    urlString = urlString + uri.host.value
    if (Objects.isPresent(uri.host.port)) {
      urlString = urlString + ':' + uri.host.port
    }
  }

  if (!Arrays.contains(excludedUriComponents, UriComponentType.Location)) {
    urlString = urlString + formatLocation(uri.location, excludedUriComponents)
  }

  return urlString
}

const formatLocation = (location: UriLocation, excludedUriComponents: Array<UriComponentType> = []): string => {
  let urlString = ''

  if (Objects.isPresent(location.path) && !Arrays.contains(excludedUriComponents, UriComponentType.Path)) {
    urlString = urlString + location.path
  }

  if (Objects.isPresent(location.query) && !Arrays.contains(excludedUriComponents, UriComponentType.Query)) {
    urlString = urlString + '?' + location.query
  }

  if (Objects.isPresent(location.fragment) && !Arrays.contains(excludedUriComponents, UriComponentType.Fragment)) {
    urlString = urlString + '#' + encode(location.fragment!)
  }

  return urlString
}
