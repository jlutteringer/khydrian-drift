import { Arrays, Objects, Strings, Uris } from '@bessemer/cornerstone'
import { Dictionary } from '@bessemer/cornerstone/types'
import { Uri, UriBuilder, UriComponent, UriLocation, UriString } from '@bessemer/cornerstone/uri'
// JOHN UPDATING URLS NEEDS WORK
export const encode = Uris.encode

export const decode = Uris.decode

export interface UrlLocation extends UriLocation {
  pathSegments: Array<string>
  parameters: Dictionary<string | Array<string>>
}

export interface Url extends Uri {
  location: UrlLocation
}

export type UrlLike = Url | UriString

const augmentUriLocation = (uriLocation: UriLocation, normalize: boolean): UrlLocation => {
  const pathSegments: Array<string> = []
  const parameters: Dictionary<string | Array<string>> = {}

  if (!Strings.isBlank(uriLocation.path)) {
    Strings.removeStart(uriLocation.path, '/')
      .split('/')
      .forEach((urlPathPart) => {
        if (!Strings.isBlank(urlPathPart) || !normalize) {
          pathSegments.push(decode(urlPathPart))
        }
      })
  }

  if (Objects.isPresent(uriLocation.query)) {
    uriLocation.query.split('&').forEach((parameterPair) => {
      let splitParameters = parameterPair.split('=')

      if (!Strings.isBlank(Arrays.first(splitParameters))) {
        let key = decode(splitParameters[0]!)
        let value = ''
        if (splitParameters.length === 2) {
          value = splitParameters[1]!
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

export const parse = (urlString: UriString, normalize: boolean = true): Url => {
  const uri = Uris.parse(urlString)
  const location = augmentUriLocation(uri.location, normalize)

  if (normalize) {
    if (!Arrays.isEmpty(location.pathSegments)) {
      location.path = (Strings.startsWith(location.path, '/') ? '/' : '') + formatPathSegments(location.pathSegments)
    } else {
      location.path = ''
    }

    location.query = formatQueryParameters(location.parameters)
  }

  return {
    ...uri,
    location,
  }
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

export const reify = (blah: UrlLike): Url => {
  if (!Strings.isString(blah)) {
    return blah
  }

  return parse(blah)
}

export const getParameter = (url: UrlLike, name: string): string | undefined => {
  const parameter = reify(url).location.parameters[name]
  if (Objects.isNil(parameter)) {
    return undefined
  }

  if (Array.isArray(parameter)) {
    throw new Error(`Expected a single parameter value but found multiple for parameter: ${name}`)
  }

  return parameter
}

export const getJsonParameter = <T>(url: UrlLike, name: string): T | undefined => {
  const value = getParameter(url, name)
  return Objects.isPresent(value) ? JSON.parse(value) : undefined
}
