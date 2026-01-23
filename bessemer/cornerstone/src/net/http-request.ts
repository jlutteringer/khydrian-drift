import { HttpMethod } from '@bessemer/cornerstone/net/http-method'
import { Url } from '@bessemer/cornerstone/net/url'
import { Dictionary } from '@bessemer/cornerstone/types'

export type HttpRequest<
  TBody = unknown,
  TPathParameters = Dictionary<unknown>,
  TQueryParameters = Dictionary<unknown>,
  THeaders = Dictionary<unknown>
> = {
  method: HttpMethod
  url: Url
  body: TBody
  pathParameters: TPathParameters
  queryParameters: TQueryParameters
  headers: THeaders
}
