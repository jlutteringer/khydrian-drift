import { Objects, Strings } from '@bessemer/cornerstone/index'
import { UrlBuilder } from '@bessemer/cornerstone/url'
import { NominalType } from '@bessemer/cornerstone/types'
import { StringSplitResult } from '@bessemer/cornerstone/string'

export const encode = (uriComponent: UriComponent) => {
  return encodeURIComponent(uriComponent)
}

export const decode = (uriComponent: UriComponent) => {
  return decodeURIComponent(uriComponent)
}

export type UriString = NominalType<string, 'UriString'>
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
  path: string
  query: string | null
  fragment: string | null
}

export interface Uri {
  scheme: UriScheme | null
  host: UriHost | null
  authentication: UriAuthentication | null
  location: UriLocation
}

export type UriParseOptions = {
  opaque: boolean // controls whether or not we support 'opaque' parsing - ie allowing some url formats which deviate from the spec
}

const parseSchemePart = (url: UriComponent, parseOptions: UriParseOptions): [UriScheme | null, UriComponent] => {
  const { selection, rest } = Strings.splitFirst(url, ':')

  // No : means no protocol is possible
  if (Objects.isNil(selection)) {
    return [null, url]
  }

  // This means the string started with :, so no protocol. We'll go ahead and remove the : from consideration
  if (Strings.isEmpty(selection)) {
    return [null, rest]
  }

  // This means we have a host and therefore we have correctly captured the protocol
  if (Strings.startsWith(rest, '//')) {
    return [selection, rest]
  }

  // Things get challenging here. If we're supporting "opaque" urls - that is urls which are not technically syntactically valid
  // then we assume that we are looking at a host/port pair
  if (parseOptions.opaque) {
    return [null, url]
  }

  // Otherwise, we need to support valid urns and can't tell the difference between an incomplete url and a urn, so since opaque is false
  // we assume it is a syntactically valid urn
  else {
    return [selection, rest]
  }
}

const parseAuthenticationPart = (url: UriComponent): [UriAuthentication | null, UriComponent] => {
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
    return [null, url]
  }

  const { rest } = Strings.splitFirst(url, '@')

  if (Strings.startsWith(targetPart, '//')) {
    return [parseAuthentication(Strings.removeStart(authentication, '//')), '//' + rest]
  } else {
    return [parseAuthentication(authentication), rest]
  }
}

const parseAuthentication = (authentication: UriComponent): UriAuthentication => {
  const { selection: principal, rest: authenticationRest } = Strings.splitFirst(authentication, ':')

  // If there isn't a colon, then there is no password but there is a username
  if (Objects.isNil(principal)) {
    return { principal: authenticationRest, password: null }
  }

  // The authentication section started with a :, don't know what to make of this... password but no username?
  if (Strings.isEmpty(principal)) {
    throw new Error(`Unable to parse Authentication: ${authentication}`)
  }

  // Otherwise, we have both, so return the complete authentication object and the rest
  return { principal, password: authenticationRest }
}

const parseHostPart = (url: UriComponent, parseOptions: UriParseOptions): [UriHost | null, UriComponent] => {
  // Check if the host is starting with reserved characters, if so we should just bail on trying to parse
  if (Strings.startsWith(url, '?') || Strings.startsWith(url, '#')) {
    return [null, url]
  }

  let hostRequired = Strings.startsWith(url, '//')
  if (!hostRequired && !parseOptions.opaque) {
    return [null, url]
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
    return [null, rest]
  }

  return [parseHost(host), rest]
}

const parseHost = (host: UriComponent): UriHost => {
  // Try to see if we have an ipv6 address like the form [2001:db8::7] and handle it
  if (Strings.startsWith(host, '[')) {
    const ipMatch = Strings.splitFirst(host, ']')

    if (Objects.isPresent(ipMatch.selection)) {
      const portMatch = Strings.splitFirst(ipMatch.rest, ':')
      if (Objects.isPresent(portMatch.selection)) {
        if (Strings.isEmpty(portMatch.selection)) {
          return { value: ipMatch.selection + ']', port: Number(portMatch.rest) }
        }
      } else {
        return { value: ipMatch.selection + ']', port: null }
      }
    }
  }

  let hostMatch: StringSplitResult = Strings.splitFirst(host, ':')

  // We have no :, which means no port, so treat the rest as the hostname
  if (Objects.isNil(hostMatch.selection)) {
    return { value: hostMatch.rest, port: null }
  }

  // The host started with a :, this is odd
  if (Strings.isEmpty(hostMatch.selection)) {
    throw new Error(`Unable to parse Host: ${host}`)
  }

  const hostName = hostMatch.selection

  // Otherwise, we have both, so return the complete authentication object and the rest
  return { value: hostName, port: Number(hostMatch.rest) }
}

const parseLocation = (url: UriComponent): UriLocation => {
  const location: UriLocation = { path: '', query: null, fragment: null }

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

  location.path = queryMatch.selection ?? queryMatch.rest
  return location
}

export const DEFAULT_PARSE_OPTIONS: UriParseOptions = {
  opaque: false,
}

export const parse = (urlString: UriString, initialParseOptions: Partial<UriParseOptions> = DEFAULT_PARSE_OPTIONS): Uri => {
  const parseOptions = Objects.merge(DEFAULT_PARSE_OPTIONS, initialParseOptions)
  const [scheme, rest1] = parseSchemePart(urlString, parseOptions)
  console.log('parseSchemePart', scheme, urlString)

  const [authentication, rest2] = parseAuthenticationPart(rest1)
  console.log('parseAuthenticationPart', authentication, rest1)

  const [host, rest3] = parseHostPart(rest2, parseOptions)
  console.log('parseHostPart', host, rest2)

  const location = parseLocation(rest3)
  console.log('parseLocationPart', location, rest3)

  const url: Uri = { scheme, host, authentication, location }
  return url
}

export const emptyLocation = (): UriLocation => {
  return {
    path: '',
    query: null,
    fragment: null,
  }
}

export type UriBuilder = {
  scheme?: string
  host?:
    | {
        value: string
        port?: number
      }
    | string
  authentication?:
    | {
        principal: string
        password?: string
      }
    | string
  location?:
    | {
        path: string
        query?: string
        fragment?: string
      }
    | string
}

export const build = (builder: UriBuilder): Uri => {
  const scheme = builder.scheme ?? null

  let host: UriHost | null = null
  if (Objects.isPresent(builder.host)) {
    if (Strings.isString(builder.host)) {
      host = parseHost(builder.host)
    } else {
      host = {
        value: builder.host.value,
        port: builder.host.port ?? null,
      }
    }
  }

  let authentication: UriAuthentication | null = null
  if (Objects.isPresent(builder.authentication)) {
    if (Strings.isString(builder.authentication)) {
      authentication = parseAuthentication(builder.authentication)
    } else {
      authentication = {
        principal: builder.authentication.principal,
        password: builder.authentication.password ?? null,
      }
    }
  }

  let location: UriLocation = emptyLocation()
  if (Objects.isPresent(builder.location)) {
    if (Strings.isString(builder.location)) {
      location = parseLocation(builder.location)
    } else {
      location = {
        path: builder.location.path,
        query: builder.location.query ?? null,
        fragment: builder.location.fragment ?? null,
      }
    }
  }

  return {
    scheme,
    host,
    authentication,
    location,
  }
}

export const format = (uri: Uri): UriString => {
  let urlString = ''
  if (Objects.isPresent(uri.scheme)) {
    urlString = urlString + uri.scheme
  }

  if (Objects.isPresent(uri.host)) {
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

  urlString = urlString + formatLocation(uri.location)
  return urlString
}

const formatLocation = (location: UriLocation): string => {
  let urlString = ''

  const includePath = !Strings.isEmpty(location.path)
  const includeParameters = !Strings.isEmpty(location.query)
  const includeFragment = !Strings.isBlank(location.fragment)

  if (includePath) {
    urlString = urlString + '/' + location.path
  }

  if (includeParameters) {
    urlString = urlString + '?' + location.query
  }

  if (includeFragment) {
    urlString = urlString + '#' + encode(location.fragment!)
  }

  return urlString
}

export const buildString = (builder: UrlBuilder): UriString => {
  return format(build(builder))
}
