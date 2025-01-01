import { Arrays, Objects, Strings, Uris } from '@bessemer/cornerstone'
import { Dictionary } from '@bessemer/cornerstone/types'
import { Uri, UriBuilder, UriComponent, UriLocation, UriParseOptions, UriString } from '@bessemer/cornerstone/uri'

export const encode = Uris.encode

export const decode = Uris.decode

export type UrlParseOptions = UriParseOptions & {
  normalize: boolean
}

export interface UrlLocation extends UriLocation {
  pathSegments: Array<string>
  parameters: Dictionary<string | Array<string>>
}

export interface Url extends Uri {
  location: UrlLocation
}

const augmentUriLocation = (uriLocation: UriLocation, collapseEmptyPathSegments: boolean): UrlLocation => {
  const pathSegments: Array<string> = []
  const parameters: Dictionary<string | Array<string>> = {}

  if (!Strings.isBlank(uriLocation.path)) {
    Strings.removeStart(uriLocation.path, '/')
      .split('/')
      .forEach((urlPathPart) => {
        if (!Strings.isBlank(urlPathPart) || !collapseEmptyPathSegments) {
          pathSegments.push(decode(urlPathPart))
        }
      })
  }

  if (Objects.isPresent(uriLocation.query)) {
    uriLocation.query.split('&').forEach((parameterPair) => {
      let splitParameters = parameterPair.split('=')

      if (!Strings.isBlank(Arrays.first(splitParameters))) {
        let key = decode(splitParameters[0])
        let value = ''
        if (splitParameters.length === 2) {
          value = splitParameters[1]
        }
        if (Objects.isNil(parameters[key])) {
          parameters[key] = decode(value)
        } else if (!Array.isArray(parameters[key])) {
          let paramList = [parameters[key]]
          paramList.push(decode(value))
          parameters[key] = paramList
        } else {
          parameters[key].push(decode(value))
        }
      }
    })
  }

  return {
    ...uriLocation,
    pathSegments,
    parameters,
  }
}

const DEFAULT_URL_PARSE_OPTIONS: UrlParseOptions = Objects.merge(Uris.DEFAULT_PARSE_OPTIONS, { opaque: true, normalize: true })

const DEFAULT_HREF_PARSE_OPTIONS: UrlParseOptions = DEFAULT_URL_PARSE_OPTIONS

export const parse = (urlString: UriString, parseOptions: UrlParseOptions = DEFAULT_URL_PARSE_OPTIONS): Url => {
  const uri = Uris.parse(urlString, parseOptions)
  const location = augmentUriLocation(uri.location, parseOptions.normalize)

  if (parseOptions.normalize) {
    location.path = formatPathSegments(location.pathSegments)
    location.query = formatQueryParameters(location.parameters)
  }

  return {
    ...uri,
    location,
  }
}

export const parseHref = (urlString: UriString, parseOptions = DEFAULT_HREF_PARSE_OPTIONS): Url => {
  return parse(urlString, parseOptions)
}

export const format = Uris.format

const formatPathSegments = (pathSegments: Array<string>): UriComponent => {
  return pathSegments.map((it) => encode(it)).join('/')
}

const formatQueryParameters = (parameters: Dictionary<string | Array<string>>): UriComponent | null => {
  const parameterEntries = Object.entries(parameters)
  if (Arrays.isEmpty(parameterEntries)) {
    return null
  }

  return Object.entries(parameters)
    .flatMap(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map((it) => `${encode(key)}=${encode(it)}`)
      } else {
        return [`${encode(key)}=${encode(value)}`]
      }
    })
    .join('&')
}

export type UrlBuilder = UriBuilder & {
  location?: {
    parameters?: Dictionary<string | Array<string>>
  }
}

export const build = (builder: UrlBuilder): Url => {
  const uri = Uris.build(builder)
  if (Objects.isPresent(builder.location?.parameters)) {
    uri.location.query = formatQueryParameters(builder.location.parameters)
  }

  const urlLocation = augmentUriLocation(uri.location, false)

  return {
    ...uri,
    location: urlLocation,
  }
}

export const buildString = (builder: UrlBuilder): UriString => {
  return format(build(builder))
}
