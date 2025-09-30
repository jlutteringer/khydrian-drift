import { TaggedType } from '@bessemer/cornerstone/types'
import { isEmpty, isString, removeStart, splitFirst, startsWith, StringSplitResult } from '@bessemer/cornerstone/string'
import { isNil, isPresent } from '@bessemer/cornerstone/object'
import { contains } from '@bessemer/cornerstone/array'

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

const parseSchemePart = (url: UriComponent): [UriScheme | null, UriComponent] => {
  // Search for the colon or double slash
  const schemeMatch = splitFirst(url, /(\/\/|:)/)

  // If we don't find either, or we hit the double slash before finding a colon, there is no scheme
  if (isNil(schemeMatch.selection) || schemeMatch.separator === '//') {
    return [null, url]
  }

  // This means the string started with :, so no protocol. We'll go ahead and remove the : from consideration
  if (isEmpty(schemeMatch.selection)) {
    return [null, schemeMatch.rest]
  } else {
    return [schemeMatch.selection, schemeMatch.rest]
  }
}

const parseAuthenticationPart = (url: UriComponent): [UriAuthentication | null, UriComponent] => {
  let targetPart = url
  const queryMatch = splitFirst(targetPart, '?')
  const fragmentMatch = splitFirst(targetPart, '#')
  if (isPresent(queryMatch.selection)) {
    targetPart = queryMatch.selection
  } else if (isPresent(fragmentMatch.selection)) {
    targetPart = fragmentMatch.selection
  }

  const { selection: authentication } = splitFirst(targetPart, '@')

  // If there is no @, then we don't have an authentication
  if (isNil(authentication)) {
    return [null, url]
  }

  const { rest } = splitFirst(url, '@')

  return [parseAuthentication(removeStart(authentication, '//')), '//' + rest]
}

const parseAuthentication = (authentication: UriComponent): UriAuthentication => {
  const { selection: principal, rest: authenticationRest } = splitFirst(authentication, ':')

  // If there isn't a colon, then there is no password but there is a username
  if (isNil(principal)) {
    return { principal: authenticationRest, password: null }
  }

  // The authentication section started with a :, don't know what to make of this... password but no username?
  if (isEmpty(principal)) {
    throw new Error(`Unable to parse Authentication: ${authentication}`)
  }

  // Otherwise, we have both, so return the complete authentication object and the rest
  return { principal, password: authenticationRest }
}

const parseHostPart = (url: UriComponent): [UriHost | null, UriComponent] => {
  // Check if the host is starting with reserved characters, if so we should just bail on trying to parse
  if (startsWith(url, '?') || startsWith(url, '#')) {
    return [null, url]
  }

  let hostRequired = startsWith(url, '//')
  if (!hostRequired) {
    return [null, url]
  }

  url = removeStart(url, '//')

  // Lets grab everything to the left of the first / ? or #, this is the remainder of our authority (if any)
  const urlMatch = splitFirst(url, /[\/?#]/)
  let host = urlMatch.rest
  let rest = ''

  if (isPresent(urlMatch.selection)) {
    host = urlMatch.selection
    rest = urlMatch.separator + urlMatch.rest
  }

  if (isEmpty(host)) {
    return [null, rest]
  }

  return [parseHost(host), rest]
}

const parseHost = (host: UriComponent): UriHost => {
  // Try to see if we have an ipv6 address like the form [2001:db8::7] and handle it
  if (startsWith(host, '[')) {
    const ipMatch = splitFirst(host, ']')

    if (isPresent(ipMatch.selection)) {
      const portMatch = splitFirst(ipMatch.rest, ':')
      if (isPresent(portMatch.selection)) {
        if (isEmpty(portMatch.selection)) {
          return { value: ipMatch.selection + ']', port: Number(portMatch.rest) }
        }
      } else {
        return { value: ipMatch.selection + ']', port: null }
      }
    }
  }

  let hostMatch: StringSplitResult = splitFirst(host, ':')

  // We have no :, which means no port, so treat the rest as the hostname
  if (isNil(hostMatch.selection)) {
    return { value: hostMatch.rest, port: null }
  }

  // The host started with a :, this is odd
  if (isEmpty(hostMatch.selection)) {
    throw new Error(`Unable to parse Host: ${host}`)
  }

  const hostName = hostMatch.selection

  // Otherwise, we have both, so return the complete authentication object and the rest
  return { value: hostName, port: Number(hostMatch.rest) }
}

const parseLocation = (url: UriComponent): UriLocation => {
  const location: UriLocation = { path: '', query: null, fragment: null }

  // Lets see if we have a fragment and parse it off the end
  const fragmentMatch = splitFirst(url, '#')
  if (isPresent(fragmentMatch.selection) && !isEmpty(fragmentMatch.rest)) {
    location.fragment = fragmentMatch.rest
  }

  // Lets see if we have a query string and parse it off the remainder
  const queryMatch = splitFirst(fragmentMatch.selection ?? fragmentMatch.rest, '?')
  if (isPresent(queryMatch.selection) && !isEmpty(queryMatch.rest)) {
    location.query = queryMatch.rest
  }

  location.path = queryMatch.selection ?? queryMatch.rest
  return location
}

export const parse = (urlString: UriString): Uri => {
  const [scheme, rest1] = parseSchemePart(urlString)
  const [authentication, rest2] = parseAuthenticationPart(rest1)
  const [host, rest3] = parseHostPart(rest2)
  const location = parseLocation(rest3)
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
  if (isPresent(builder.host)) {
    if (isString(builder.host)) {
      host = parseHost(builder.host)
    } else {
      host = {
        value: builder.host.value,
        port: builder.host.port ?? null,
      }
    }
  }

  let authentication: UriAuthentication | null = null
  if (isPresent(builder.authentication)) {
    if (isString(builder.authentication)) {
      authentication = parseAuthentication(builder.authentication)
    } else {
      authentication = {
        principal: builder.authentication.principal,
        password: builder.authentication.password ?? null,
      }
    }
  }

  let location: UriLocation = emptyLocation()
  if (isPresent(builder.location)) {
    if (isString(builder.location)) {
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

export enum UriComponentType {
  Scheme = 'Scheme',
  Host = 'Host',
  Location = 'Location',
}

export const format = (uri: Uri, format: Array<UriComponentType> = Object.values(UriComponentType)): UriString => {
  let urlString = ''
  if (isPresent(uri.scheme) && contains(format, UriComponentType.Scheme)) {
    urlString = urlString + uri.scheme
  }

  if (isPresent(uri.host) && contains(format, UriComponentType.Host)) {
    if (isPresent(uri.scheme)) {
      urlString = urlString + '://'
    }

    if (isPresent(uri.authentication)) {
      urlString = urlString + uri.authentication.principal

      if (isPresent(uri.authentication.password)) {
        urlString = urlString + ':' + uri.authentication.password
      }

      urlString = urlString + '@'
    }

    urlString = urlString + uri.host.value

    if (isPresent(uri.host.port)) {
      urlString = urlString + ':' + uri.host.port
    }
  }

  if (contains(format, UriComponentType.Location)) {
    urlString = urlString + formatLocation(uri.location, format)
  }
  return urlString
}

const formatLocation = (location: UriLocation, format: Array<UriComponentType>): string => {
  let urlString = ''

  if (!isEmpty(location.path)) {
    urlString = urlString + location.path
  }

  if (!isEmpty(location.query)) {
    urlString = urlString + '?' + location.query
  }

  if (!isEmpty(location.fragment)) {
    urlString = urlString + '#' + encode(location.fragment!)
  }

  return urlString
}

export const buildString = (builder: UriBuilder): UriString => {
  return format(build(builder))
}
