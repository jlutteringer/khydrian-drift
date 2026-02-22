import * as Results from '@bessemer/cornerstone/result'
import { Result } from '@bessemer/cornerstone/result'
import * as ErrorEvents from '@bessemer/cornerstone/error/error-event'
import { ErrorEvent } from '@bessemer/cornerstone/error/error-event'
import { createNamespace } from '@bessemer/cornerstone/resource-key'
import { Dictionary, NominalType } from '@bessemer/cornerstone/types'
import * as MimeTypes from '@bessemer/cornerstone/mime-type'
import { MimeLiteral } from '@bessemer/cornerstone/mime-type'
import * as Strings from '@bessemer/cornerstone/string'
import * as Objects from '@bessemer/cornerstone/object'

export const Namespace = createNamespace('content-type')
export type ContentType = { mimeType: MimeLiteral; parameters: Dictionary<string> }
export type ContentTypeLiteral = NominalType<string, typeof Namespace>

export type ContentTypeLike = ContentType | ContentTypeLiteral | MimeLiteral

export function from(value: ContentTypeLike | string): ContentType
export function from(value: ContentTypeLike | string | null): ContentType | null
export function from(value: ContentTypeLike | string | undefined): ContentType | undefined
export function from(value: ContentTypeLike | string | null | undefined): ContentType | null | undefined
export function from(value: ContentTypeLike | string | null | undefined): ContentType | null | undefined {
  if (Objects.isNil(value)) {
    return value
  }

  if (Strings.isString(value)) {
    return ErrorEvents.unpackResult(parseString(value))
  }

  return value
}

export function toLiteral(likeValue: ContentTypeLike): ContentTypeLiteral
export function toLiteral(likeValue: ContentTypeLike | null): ContentTypeLiteral | null
export function toLiteral(likeValue: ContentTypeLike | undefined): ContentTypeLiteral | undefined
export function toLiteral(likeValue: ContentTypeLike | null | undefined): ContentTypeLiteral | null | undefined
export function toLiteral(likeValue: ContentTypeLike | null | undefined): ContentTypeLiteral | null | undefined {
  if (Objects.isNil(likeValue)) {
    return likeValue
  }

  const value = from(likeValue)

  if (Objects.isEmpty(value.parameters)) {
    return value.mimeType as ContentTypeLiteral
  }

  const params = Object.entries(value.parameters).map(([key, val]) => {
    // Quote the value if it contains special characters or spaces
    const needsQuoting = /[ ()<>@,;:\\/[\]?=]/.test(val) || Strings.isEmpty(val)
    const quotedValue = needsQuoting ? `"${val}"` : val
    return `${key}=${quotedValue}`
  })

  return `${value.mimeType};${params.join(';')}` as ContentTypeLiteral
}

// RFC 2045 token: 1*<any (US-ASCII) CHAR except SPACE, CTLs, or tspecials>
// tspecials: ()<>@,;:\"/[]?=
const TokenKeyRegex = /^[!#$%&'*+\-.0-9A-Z^_`a-z|~]+$/

// JOHN some of the error messages here should be looked at
export const parseString = (value: string): Result<ContentType, ErrorEvent> => {
  const tokens = value.split(';')
  const mimeTypeString = tokens[0]!
  const mimeType = MimeTypes.parseString(mimeTypeString)

  if (Results.isFailure(mimeType)) {
    return mimeType
  }

  if (tokens.length === 1) {
    return Results.success({ mimeType, parameters: {} })
  }

  const parameters: Dictionary<string> = {}

  for (const token of tokens.slice(1)) {
    const keyPart = Strings.splitFirst(token, '=')

    if (Objects.isNil(keyPart.selection)) {
      return Results.failure(
        ErrorEvents.invalidValue(value, {
          namespace: Namespace,
          message: `[${Namespace}]: Invalid Content-Type parameter format: [${token}]. Parameters must be in key=value format.`,
        })
      )
    }

    const tokenKey = keyPart.selection.trim()
    if (!TokenKeyRegex.test(tokenKey)) {
      return Results.failure(
        ErrorEvents.invalidValue(value, {
          namespace: Namespace,
          message: `[${Namespace}]: Invalid Content-Type parameter format: [${token}]. Parameters must be in key=value format.`,
        })
      )
    }

    let tokenValue = keyPart.rest.trim()
    if (Strings.isEmpty(tokenValue)) {
      return Results.failure(
        ErrorEvents.invalidValue(value, {
          namespace: Namespace,
          message: `[${Namespace}]: Invalid Content-Type parameter value for [${tokenKey}]: value cant be blank.`,
        })
      )
    }

    // Validate token value
    if (tokenValue.startsWith('"')) {
      // Quoted value: must end with quote and have properly escaped internal quotes
      if (!tokenValue.endsWith('"')) {
        return Results.failure(
          ErrorEvents.invalidValue(value, {
            namespace: Namespace,
            message: `[${Namespace}]: Invalid Content-Type parameter value for [${tokenKey}]: quoted value must end with a quote.`,
          })
        )
      }

      // Check for unescaped quotes inside
      const innerValue = tokenValue.slice(1, -1)
      for (let i = 0; i < innerValue.length; i++) {
        if (innerValue[i] === '"' && (i === 0 || innerValue[i - 1] !== '\\')) {
          return Results.failure(
            ErrorEvents.invalidValue(value, {
              namespace: Namespace,
              message: `[${Namespace}]: Invalid Content-Type parameter value for [${tokenKey}]: unescaped quote found inside quoted value.`,
            })
          )
        }
      }

      tokenValue = Strings.removeStart(Strings.removeEnd(tokenValue, '"'), '"').replaceAll('\\"', '"')
    } else if (tokenValue.includes('"')) {
      // Unquoted value: cannot contain quotes at all
      return Results.failure(
        ErrorEvents.invalidValue(value, {
          namespace: Namespace,
          message: `[${Namespace}]: Invalid Content-Type parameter value for [${tokenKey}]: unquoted value cannot contain quotes.`,
        })
      )
    }

    if (Objects.isPresent(parameters[tokenKey])) {
      return Results.failure(
        ErrorEvents.invalidValue(value, {
          namespace: Namespace,
          message: `[${Namespace}]: Invalid Content-Type parameter value for [${tokenKey}]: duplicate parameter key found.`,
        })
      )
    }

    parameters[tokenKey] = tokenValue
  }

  return Results.success({ mimeType, parameters })
}
