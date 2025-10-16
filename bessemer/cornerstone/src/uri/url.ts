import { Dictionary, NominalType } from '@bessemer/cornerstone/types'
import * as Uris from '@bessemer/cornerstone/uri/uri'
import { Uri, UriBuilder, UriComponent, UriLocation } from '@bessemer/cornerstone/uri/uri'
import { failure, mapResult, Result, success } from '@bessemer/cornerstone/result'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { isError } from '@bessemer/cornerstone/error/error'
import * as Strings from '@bessemer/cornerstone/string'
import { first, isEmpty } from '@bessemer/cornerstone/array'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'
import Zod from 'zod'
import * as Equalitors from '@bessemer/cornerstone/equalitor'
import { Equalitor } from '@bessemer/cornerstone/equalitor'
import { MergeExclusive } from 'type-fest'
import * as Objects from '@bessemer/cornerstone/object'

// JOHN UPDATING URLS NEEDS WORK
export const encode = Uris.encode

export const decode = Uris.decode

export interface UrlLocation extends UriLocation {
  relative: boolean
  pathSegments: Array<string>
  parameters: Dictionary<string | Array<string>>
}

export interface Url extends Uri {
  _type: typeof Namespace
  location: UrlLocation
}

export const Namespace = Uris.UrlNamespace
export const EqualBy: Equalitor<Url> = Equalitors.deepNatural()

export type UrlLiteral = NominalType<string, typeof Namespace>

type UrlBuilderPathPart = MergeExclusive<{ path?: string | null }, { pathSegments?: Array<string>; relative?: boolean }>
type UrlBuilderQueryPart = MergeExclusive<{ query?: string | null }, { parameters?: Dictionary<string | Array<string>> }>
type UrlBuilderLocationPart = UrlBuilderPathPart &
  UrlBuilderQueryPart & {
    fragment?: string | null
  }

export type UrlBuilder = UriBuilder & {
  location?: UrlBuilderLocationPart | null | undefined
}

export type UrlLike = Url | UrlLiteral | UrlBuilder

export const blah = (uri: Uri): Url => {}

export const parseString = (value: string, normalize = true): Result<Url, ErrorEvent> => {
  try {
    const result = Uris.parseString(value)
    if (!result.isSuccess) {
      return result
    }

    const uri = result.value
    const location = augmentUriLocation(uri.location, normalize)

    if (normalize) {
      if (!isEmpty(location.pathSegments)) {
        location.path = ((location.path ?? '').startsWith('/') ? '/' : '') + formatPathSegments(location.pathSegments)
      } else {
        location.path = null
      }

      location.query = formatQueryParameters(location.parameters)
    }

    return success({
      ...uri,
      type: 'url',
      location,
    })
  } catch (e) {
    if (!isError(e)) {
      throw e
    }

    return failure(invalidValue(value, { namespace: Namespace, message: e.message }))
  }
}

export const fromString = (value: string): Url => {
  return unpackResult(parseString(value))
}

export function from(value: UrlLike): Url
export function from(value: UrlLike | null): Url | null
export function from(value: UrlLike | undefined): Url | undefined
export function from(value: UrlLike | null | undefined): Url | null | undefined
export function from(value: UrlLike | null | undefined): Url | null | undefined {
  if (Objects.isNil(value)) {
    return value
  }
  if (isUrl(value)) {
    return value
  }
  if (Strings.isString(value)) {
    return fromString(value)
  }

  return build(value as UrlBuilder)
}

export function toLiteral(likeValue: UrlLike): UrlLiteral
export function toLiteral(likeValue: UrlLike | null): UrlLiteral | null
export function toLiteral(likeValue: UrlLike | undefined): UrlLiteral | undefined
export function toLiteral(likeValue: UrlLike | null | undefined): UrlLiteral | null | undefined
export function toLiteral(likeValue: UrlLike | null | undefined): UrlLiteral | null | undefined {
  if (Objects.isNil(likeValue)) {
    return likeValue
  }

  const value = from(likeValue)
  return format(value) as UrlLiteral
}

export const SchemaLiteral = structuredTransform(Zod.string(), (it: string) => mapResult(parseString(it), (it) => toLiteral(it)))
// JOHN need a schema for the object version...
// export const SchemaInstance = structuredTransform(Zod.string(), parseString)

export const isUrl = (value: unknown): value is Url => {
  if (!Objects.isObject(value)) {
    return false
  }

  const uriValue = value as any as Url
  return uriValue._type === Namespace
}

export const format = Uris.format

const build = (builder: UrlBuilder): Url => {
  if ((builder.location?.relative ?? false) && Objects.isPresent(builder.host)) {
    throw new Error(`[${Namespace}]: Unable to construct a relative url with a non-null host: ${builder}`)
  }

  const uriBuilder = convertUrlBuilderToUriBuilder(builder)
  const uri = Uris.from(uriBuilder)
  const urlLocation = augmentUriLocation(uri.location)

  return {
    ...uri,
    _type: Namespace,
    location: urlLocation,
  }
}

const convertUrlBuilderToUriBuilder = (builder: UrlBuilder): UriBuilder => {
  if (Objects.isNil(builder.location)) {
    return builder
  }

  let path = builder.location.path
  if (Objects.isPresent(builder.location.pathSegments)) {
    const relative = builder.location.relative ?? false
    const formattedSegments = formatPathSegments(builder.location.pathSegments)
    path = (relative ? '' : '/') + formattedSegments
  }

  let query = builder.location.query
  if (Objects.isPresent(builder.location.parameters)) {
    query = formatQueryParameters(builder.location.parameters)
  }

  return {
    ...builder,
    location: { path, query, fragment: builder.location.fragment },
  }
}

const formatPathSegments = (pathSegments: Array<string>): UriComponent => {
  return pathSegments.map((it) => encode(it)).join('/')
}

const formatQueryParameters = (parameters: Dictionary<string | Array<string>>): UriComponent | null => {
  const parameterEntries = Object.entries(parameters)
  if (isEmpty(parameterEntries)) {
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

const augmentUriLocation = (uriLocation: UriLocation): UrlLocation => {
  let relative: boolean = false
  let pathSegments: Array<string> = []
  const parameters: Dictionary<string | Array<string>> = {}

  if (Objects.isPresent(uriLocation.path)) {
    if (!uriLocation.path.startsWith('/')) {
      relative = true
    }

    pathSegments = Strings.removeStart(uriLocation.path, '/')
      .split('/')
      .filter((it) => !Strings.isBlank(it))
      .map((urlPathPart) => decode(urlPathPart))
  }

  if (Objects.isPresent(uriLocation.query)) {
    uriLocation.query.split('&').forEach((parameterPair) => {
      let splitParameters = parameterPair.split('=')

      if (!Strings.isBlank(first(splitParameters))) {
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
    relative,
    pathSegments,
    parameters,
  }
}

export const getParameter = (url: UrlLike, name: string): string | undefined => {
  const parameter = from(url).location.parameters[name]
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
