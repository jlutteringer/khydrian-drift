import { Dictionary } from '@bessemer/cornerstone/types'
import * as Objects from '@bessemer/cornerstone/object'
import * as Strings from '@bessemer/cornerstone/string'
import * as ContentTypes from '@bessemer/cornerstone/net/content-type'
import * as MimeTypes from '@bessemer/cornerstone/mime-type'

export type FetchRequest = NonNullable<Parameters<typeof fetch>[1]>
export type FetchResponse = Awaited<ReturnType<typeof fetch>>
export type FetchPayload = { url: string } & FetchRequest
export type FetchFunction = (url: string, request: FetchRequest | undefined) => Promise<FetchResponse>

export type FetchRequestDto = {
  url: string
  headers?: Dictionary<string>
  body?: string
} & Pick<FetchRequest, 'method' | 'mode' | 'credentials' | 'cache' | 'redirect' | 'referrer' | 'integrity'>

export type FetchResponseDto = { url: string }

export const serializeRequest = (request: FetchPayload): FetchRequestDto => {
  const dto: FetchRequestDto = { url: request.url }

  if (Objects.isPresent(dto.method)) {
    dto.method = request.method
  }
  if (Objects.isPresent(request.mode)) {
    dto.mode = request.mode
  }
  if (Objects.isPresent(request.credentials)) {
    dto.credentials = request.credentials
  }
  if (Objects.isPresent(request.cache)) {
    dto.cache = request.cache
  }
  if (Objects.isPresent(request.redirect)) {
    dto.redirect = request.redirect
  }
  if (Objects.isPresent(request.referrer)) {
    dto.referrer = request.referrer
  }
  if (Objects.isPresent(request.integrity)) {
    dto.integrity = request.integrity
  }

  if (Objects.isPresent(request.headers)) {
    const headers: Dictionary<string> = {}
    const headersObj = request.headers instanceof Headers ? request.headers : new Headers(request.headers)
    headersObj.forEach((value, key) => {
      headers[key] = value
    })

    if (!Objects.isEmpty(headers)) {
      dto.headers = headers
    }
  }

  if (Objects.isPresent(request.body)) {
    if (Strings.isString(request.body)) {
      dto.body = request.body
    } else {
      const headersObj = request.headers instanceof Headers ? request.headers : new Headers(request.headers)
      const contentType = headersObj.get('Content-Type')

      if (Objects.isPresent(contentType) && ContentTypes.from(contentType).mimeType === MimeTypes.Json) {
        try {
          dto.body = JSON.stringify(request.body)
        } catch {
          dto.body = Object.prototype.toString.call(request.body)
        }
      } else {
        // FormData, Blob, ArrayBuffer, etc. are not serializable to JSON
        dto.body = Object.prototype.toString.call(request.body)
      }
    }
  }

  return dto
}

export const serializeResponse = (response: FetchResponse): FetchResponseDto => {
  return { url: response.url }
}
