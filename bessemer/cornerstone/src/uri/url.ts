import { Dictionary, NominalType } from '@bessemer/cornerstone/types'
import {
  decode as uriDecode,
  encode as uriEncode,
  format as uriFormat,
  from as uriFrom,
  parseString as uriParseString,
  Uri,
  UriBuilder,
  UriComponent,
  UriLocation,
} from '@bessemer/cornerstone/uri/uri'
import { namespace } from '@bessemer/cornerstone/resource-key'
import { failure, mapResult, Result, success } from '@bessemer/cornerstone/result'
import { ErrorEvent, invalidValue, unpackResult } from '@bessemer/cornerstone/error/error-event'
import { isError } from '@bessemer/cornerstone/error/error'
import { isNil, isObject, isPresent } from '@bessemer/cornerstone/object'
import { isBlank, isString, removeStart } from '@bessemer/cornerstone/string'
import { first, isEmpty } from '@bessemer/cornerstone/array'
import { structuredTransform } from '@bessemer/cornerstone/zod-util'
import Zod from 'zod'

// JOHN UPDATING URLS NEEDS WORK
export const encode = uriEncode

export const decode = uriDecode

export interface UrlLocation extends UriLocation {
  pathSegments: Array<string>
  parameters: Dictionary<string | Array<string>>
}

export interface Url extends Uri {
  type: 'url'
  location: UrlLocation
}

export const Namespace = namespace('url')
export type UrlLiteral = NominalType<string, typeof Namespace>

type UrlBuilderParametersPart = { parameters?: Dictionary<string | Array<string>> }

export type UrlBuilder = UriBuilder & {
  location?:
    | ({
        path?: string | null
        fragment?: string | null
      } & (UrlBuilderParametersPart | { query?: string | null }))
    | string
    | null
}

export type UrlLike = Url | UrlLiteral | UrlBuilder

export const parseString = (value: string, normalize = true): Result<Url, ErrorEvent> => {
  try {
    // JOHN parse should be rewritten to return descriptive result objects
    const result = uriParseString(value)
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
  if (isNil(value)) {
    return value
  }
  if (isUrl(value)) {
    return value
  }
  if (isString(value)) {
    return fromString(value)
  }

  return build(value as UrlBuilder)
}

export function toLiteral(likeValue: UrlLike): UrlLiteral
export function toLiteral(likeValue: UrlLike | null): UrlLiteral | null
export function toLiteral(likeValue: UrlLike | undefined): UrlLiteral | undefined
export function toLiteral(likeValue: UrlLike | null | undefined): UrlLiteral | null | undefined
export function toLiteral(likeValue: UrlLike | null | undefined): UrlLiteral | null | undefined {
  if (isNil(likeValue)) {
    return likeValue
  }

  const value = from(likeValue)
  return format(value) as UrlLiteral
}

export const SchemaLiteral = structuredTransform(Zod.string(), (it: string) => mapResult(parseString(it), (it) => toLiteral(it)))
// JOHN need a schema for the object version...
// export const SchemaInstance = structuredTransform(Zod.string(), parseString)

export const isUrl = (value: unknown): value is Url => {
  if (!isObject(value)) {
    return false
  }

  const uriValue = value as any as Url
  return uriValue.type === 'url'
}

const augmentUriLocation = (uriLocation: UriLocation, normalize: boolean): UrlLocation => {
  const pathSegments: Array<string> = []
  const parameters: Dictionary<string | Array<string>> = {}

  if (isPresent(uriLocation.path)) {
    removeStart(uriLocation.path, '/')
      .split('/')
      .forEach((urlPathPart) => {
        if (!isBlank(urlPathPart) || !normalize) {
          pathSegments.push(decode(urlPathPart))
        }
      })
  }

  if (isPresent(uriLocation.query)) {
    uriLocation.query.split('&').forEach((parameterPair) => {
      let splitParameters = parameterPair.split('=')

      if (!isBlank(first(splitParameters))) {
        let key = decode(splitParameters[0]!)
        let value = ''
        if (splitParameters.length === 2) {
          value = splitParameters[1]!
        }
        if (isNil(parameters[key])) {
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

export const format = uriFormat

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

const build = (builder: UrlBuilder): Url => {
  const uri = uriFrom(builder)

  if (isPresent(builder.location)) {
    const parameters = builder.location as UrlBuilderParametersPart

    if (isPresent(parameters.parameters)) {
      uri.location.query = formatQueryParameters(parameters.parameters)
    }
  }

  const urlLocation = augmentUriLocation(uri.location, false)
  return {
    ...uri,
    type: 'url',
    location: urlLocation,
  }
}

export const getParameter = (url: UrlLike, name: string): string | undefined => {
  const parameter = from(url).location.parameters[name]
  if (isNil(parameter)) {
    return undefined
  }

  if (Array.isArray(parameter)) {
    throw new Error(`Expected a single parameter value but found multiple for parameter: ${name}`)
  }

  return parameter
}

export const getJsonParameter = <T>(url: UrlLike, name: string): T | undefined => {
  const value = getParameter(url, name)
  return isPresent(value) ? JSON.parse(value) : undefined
}
