import { FetchPayload } from '@bessemer/cornerstone/net/fetch'
import { ZotchRequestContext, ZotchResponseContext } from '@bessemer/zotch/zotch-types'

// JOHN consider making our error regime serializable

export enum ZotchErrorType {
  RequestInvalid = 'RequestInvalid',
  ResponseInvalid = 'ResponseInvalid',
  FetchFailed = 'FetchFailed',
  Unstructured = 'Unstructured',
  Structured = 'Structured',
}

export type ZotchRequestInvalidError = ZotchRequestContext & {
  type: ZotchErrorType.RequestInvalid
  message: string
  value: unknown
  cause?: Error
}

export type ZotchResponseInvalidError = ZotchResponseContext & {
  type: ZotchErrorType.ResponseInvalid
  message: string
  value: unknown
  cause?: Error
}

export type ZotchFetchFailedError = ZotchRequestContext & {
  type: ZotchErrorType.FetchFailed
  fetch: FetchPayload
  cause: Error
}

export type ZotchUnstructuredError = ZotchResponseContext & {
  type: ZotchErrorType.Unstructured
}

export type ZotchStructuredErrorProps = {
  status: number
  value: unknown
}

export type ZotchStructuredError<T extends ZotchStructuredErrorProps> = {
  type: ZotchErrorType.Structured
} & T

export type ZotchError<T extends ZotchStructuredErrorProps = ZotchStructuredErrorProps> =
  | ZotchRequestInvalidError
  | ZotchResponseInvalidError
  | ZotchFetchFailedError
  | ZotchUnstructuredError
  | ZotchStructuredError<T>
