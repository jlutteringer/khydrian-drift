import * as Fetching from '@bessemer/cornerstone/net/fetch'
import { FetchPayload, FetchRequestDto, FetchResponseDto } from '@bessemer/cornerstone/net/fetch'
import { ZotchRequest, ZotchRequestContext, ZotchRequestDto, ZotchResponseContext } from '@bessemer/zotch/zotch-types'
import { ErrorDto } from '@bessemer/cornerstone/error/error'
import { Errors, Objects } from '@bessemer/cornerstone'

export enum ZotchErrorType {
  RequestInvalid = 'RequestInvalid',
  ResponseInvalid = 'ResponseInvalid',
  FetchFailed = 'FetchFailed',
  Unstructured = 'Unstructured',
  Structured = 'Structured',
}

export type ZotchErrorRequestContext = {
  endpoint: string
  request: ZotchRequestDto
}

export type ZotchErrorResponseContext = ZotchErrorRequestContext & {
  fetch: FetchRequestDto
  response: FetchResponseDto
}

export type ZotchRequestInvalidError = ZotchErrorRequestContext & {
  type: ZotchErrorType.RequestInvalid
  message: string
  value: unknown
  cause: ErrorDto | null
}

const serializeRequest = (request: ZotchRequest): ZotchRequestDto => {
  return {
    baseUrl: request.baseUrl ?? null,
    url: request.url,
    method: request.method,
    params: request.params,
    queries: request.queries,
    headers: request.headers,
  }
}

export const requestInvalid = ({
  message,
  value,
  cause,
  alias,
  request,
}: {
  message: string
  value: unknown
  cause?: Error
} & ZotchRequestContext): ZotchRequestInvalidError => {
  return {
    type: ZotchErrorType.RequestInvalid,
    message,
    value,
    cause: Objects.isPresent(cause) ? Errors.serialize(cause) : null,
    endpoint: alias,
    request: serializeRequest(request),
  }
}

export type ZotchResponseInvalidError = ZotchErrorResponseContext & {
  type: ZotchErrorType.ResponseInvalid
  message: string
  value: unknown
  cause: ErrorDto | null
}

export const responseInvalid = ({
  message,
  value,
  cause,
  alias,
  request,
  fetch,
  response,
}: {
  message: string
  value: unknown
  cause?: Error
} & ZotchResponseContext): ZotchResponseInvalidError => {
  return {
    type: ZotchErrorType.ResponseInvalid,
    message,
    value,
    cause: Objects.isPresent(cause) ? Errors.serialize(cause) : null,
    endpoint: alias,
    request: serializeRequest(request),
    fetch: Fetching.serializeRequest(fetch),
    response: Fetching.serializeResponse(response),
  }
}

export type ZotchFetchFailedError = ZotchErrorRequestContext & {
  type: ZotchErrorType.FetchFailed
  fetch: FetchRequestDto
  cause: ErrorDto
}

export const fetchFailed = ({ alias, request, fetch, cause }: { fetch: FetchPayload; cause: Error } & ZotchRequestContext): ZotchFetchFailedError => {
  return {
    type: ZotchErrorType.FetchFailed,
    fetch: Fetching.serializeRequest(fetch),
    cause: Errors.serialize(cause),
    endpoint: alias,
    request: serializeRequest(request),
  }
}

export type ZotchUnstructuredError = ZotchErrorResponseContext & {
  type: ZotchErrorType.Unstructured
}

export const unstructured = ({ alias, request, fetch, response }: ZotchResponseContext): ZotchUnstructuredError => {
  return {
    type: ZotchErrorType.Unstructured,
    endpoint: alias,
    request: serializeRequest(request),
    fetch: Fetching.serializeRequest(fetch),
    response: Fetching.serializeResponse(response),
  }
}

export type ZotchStructuredErrorProps = {
  status: number
  value: unknown
}

export type ZotchStructuredError<
  T extends ZotchStructuredErrorProps = {
    status: number
    value: unknown
  }
> = {
  type: ZotchErrorType.Structured
} & T

export type ZotchError<T extends ZotchStructuredErrorProps = ZotchStructuredErrorProps> =
  | ZotchRequestInvalidError
  | ZotchResponseInvalidError
  | ZotchFetchFailedError
  | ZotchUnstructuredError
  | ZotchStructuredError<T>
