import type {
  Merge,
  NeverIfEmpty,
  PathParamNames,
  PickDefined,
  RequiredKeys,
  SetPropsOptionalIfChildrenAreOptional,
  Simplify,
  UndefinedIfNever,
} from '@bessemer/zotch/zotch-type-utils'
import z from 'zod'
import Zod, { ZodType } from 'zod'
import { Result } from '@bessemer/cornerstone/result'
import { ZotchError } from '@bessemer/zotch/zotch-error'
import { HttpMethod } from '@bessemer/cornerstone/net/http-method'
import { FetchPayload, FetchRequest, FetchResponse } from '@bessemer/cornerstone/net/fetch'
import { PartialOnUndefinedDeep, ReadonlyDeep, SetRequired } from 'type-fest'
import { Dictionary } from '@bessemer/cornerstone/types'

export type ZotchRequest<D = any> = Omit<FetchRequest, 'body' | 'method' | 'headers'> & {
  baseUrl?: string
  url: string
  method: HttpMethod
  params?: Record<string, unknown>
  queries?: Record<string, unknown>
  headers?: Record<string, string>
  body?: D
}

export type ZotchRequestDto<D = any> = SetRequired<ZotchRequest, 'params' | 'method' | 'headers'>

export type ResponseType = 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream' | 'formdata'

export type MutationMethod = 'post' | 'put' | 'patch' | 'delete'

export type RequestFormat =
  | 'json' // default
  | 'form-data' // for file uploads
  | 'form-url' // for hiding query params in the body
  | 'binary' // for binary data / file uploads
  | 'text' // for text data

export type ZodiosEndpointDefinitionByAlias<Api extends ZotchEndpointDefinitions, Alias extends string> = Api[Alias]

export type Aliases<Api extends ZotchEndpointDefinitions> = keyof Api & string

export type ZotchErrorTypeByAlias<Api extends ZotchEndpointDefinitions, Alias extends string> = NonNullable<
  ZodiosEndpointDefinitionByAlias<Api, Alias>['errors']
>[number] extends infer E
  ? E extends ZodiosEndpointError
    ? {
        status: E['status']
        value: z.output<E['schema']>
      }
    : never
  : never

export type ZotchPayloadTypeByAlias<
  Api extends ZotchEndpointDefinitions,
  Alias extends string,
  ExpandType extends boolean = true
> = ExpandType extends true ? z.output<ZodiosEndpointDefinitionByAlias<Api, Alias>['response']> : never

export type ZotchResponseByAlias<
  Api extends ZotchEndpointDefinitions,
  Alias extends string,
  ExpandType extends boolean = true
> = ExpandType extends true ? Result<ZotchPayloadTypeByAlias<Api, Alias>, ZotchError<ZotchErrorTypeByAlias<Api, Alias>>> : never

export type BodySchemaForEndpoint<Endpoint extends ZotchEndpointDefinitionEntry> = NonNullable<Endpoint['body']>

export type ZodiosBodyForEndpoint<Endpoint extends ZotchEndpointDefinitionEntry, Frontend extends boolean = true> = Frontend extends true
  ? z.input<BodySchemaForEndpoint<Endpoint>>
  : z.output<BodySchemaForEndpoint<Endpoint>>

export type BodySchemaByAlias<Api extends ZotchEndpointDefinitions, Alias extends string> = NonNullable<
  ZodiosEndpointDefinitionByAlias<Api, Alias>['body']
>

export type ZodiosBodyByAlias<Api extends ZotchEndpointDefinitions, Alias extends string, Frontend extends boolean = true> = Frontend extends true
  ? z.input<BodySchemaByAlias<Api, Alias>>
  : z.output<BodySchemaByAlias<Api, Alias>>

export type ZodiosQueryParamsForEndpoint<Endpoint extends ZotchEndpointDefinitionEntry, Frontend extends boolean = true> = ZodSchemaMapToInput<
  NonNullable<Endpoint['queries']>
>

export type ZodiosQueryParamsByAlias<
  Api extends ZotchEndpointDefinitions,
  Alias extends string,
  Frontend extends boolean = true
> = ZodSchemaMapToInput<NonNullable<ZodiosEndpointDefinitionByAlias<Api, Alias>['queries']>>

export type ZodiosPathParamsForEndpoint<
  Endpoint extends ZotchEndpointDefinitionEntry,
  Frontend extends boolean = true,
  PathParameters = ZodSchemaMapToInput<NonNullable<Endpoint['params']>>
> = NeverIfEmpty<
  Simplify<
    Omit<
      {
        [K in PathParamNames<Endpoint['path']>]: string | number | boolean
      },
      keyof PathParameters
    > &
      PathParameters
  >
>

/**
 * Get path params for a given endpoint by alias
 */
export type ZodiosPathParamByAlias<
  Api extends ZotchEndpointDefinitions,
  Alias extends string,
  Frontend extends boolean = true,
  EndpointDefinition extends ZotchEndpointDefinitionEntry = ZodiosEndpointDefinitionByAlias<Api, Alias>,
  Path = EndpointDefinition['path'],
  PathParameters = ZodSchemaMapToInput<NonNullable<EndpointDefinition['params']>>,
  $PathParamNames extends string = PathParamNames<Path>
> = NeverIfEmpty<
  Simplify<
    Omit<
      {
        [K in $PathParamNames]: string | number | boolean
      },
      keyof PathParameters
    > &
      PathParameters
  >
>

export type ZodiosHeaderParamsForEndpoint<Endpoint extends ZotchEndpointDefinitionEntry, Frontend extends boolean = true> = ZodSchemaMapToInput<
  NonNullable<Endpoint['headers']>
>

type ZodSchemaMapToInput<T extends Dictionary<ZodType>> = PartialOnUndefinedDeep<{
  [Key in keyof T]: Zod.input<T[Key]>
}>

export type ZodiosHeaderParamsByAlias<
  Api extends ZotchEndpointDefinitions,
  Alias extends string,
  Frontend extends boolean = true
> = ZodSchemaMapToInput<NonNullable<ZodiosEndpointDefinitionByAlias<Api, Alias>['headers']>>

export type ZodiosRequestOptionsByAlias<Api extends ZotchEndpointDefinitions, Alias extends string> = Merge<
  SetPropsOptionalIfChildrenAreOptional<
    PickDefined<{
      params: ZodiosPathParamByAlias<Api, Alias>
      queries: ZodiosQueryParamsByAlias<Api, Alias>
      headers: ZodiosHeaderParamsByAlias<Api, Alias>
    }>
  >,
  Omit<ZotchRequest, 'params' | 'queries' | 'headers' | 'data' | 'method' | 'url'>
>

export type ZodiosMutationAliasRequest<Body, Config, Response> = RequiredKeys<Config> extends never
  ? (body: ReadonlyDeep<UndefinedIfNever<Body>>, configOptions?: ReadonlyDeep<Config>) => Promise<Response>
  : (body: ReadonlyDeep<UndefinedIfNever<Body>>, configOptions: ReadonlyDeep<Config>) => Promise<Response>

export type ZodiosAliasRequest<Config, Response> = RequiredKeys<Config> extends never
  ? (configOptions?: ReadonlyDeep<Config>) => Promise<Response>
  : (configOptions: ReadonlyDeep<Config>) => Promise<Response>

export type ZotchAliases<Api extends ZotchEndpointDefinitions> = {
  [Alias in Aliases<Api>]: ZodiosEndpointDefinitionByAlias<Api, Alias>['method'] extends MutationMethod
    ? ZodiosMutationAliasRequest<ZodiosBodyByAlias<Api, Alias>, ZodiosRequestOptionsByAlias<Api, Alias>, ZotchResponseByAlias<Api, Alias>>
    : ZodiosAliasRequest<ZodiosRequestOptionsByAlias<Api, Alias>, ZotchResponseByAlias<Api, Alias>>
}

export type ZodiosEndpointError<T = unknown> = {
  /**
   * status code of the error
   */
  status: number

  /**
   * description of the error - used to generate the openapi error description
   */
  description?: string

  /**
   * schema of the error
   */
  schema: z.ZodType<T>
}

/**
 * Zodios enpoint definition that should be used to create a new instance of Zodios
 */
export interface ZotchEndpointDefinitionEntry<R = unknown> {
  method: HttpMethod
  path: string
  description?: string
  /**
   * optional request format of the endpoint: json, form-data, form-url, binary, text
   */
  requestFormat?: RequestFormat

  body?: ZodType
  headers?: Dictionary<ZodType>
  queries?: Dictionary<ZodType>
  params?: Dictionary<ZodType>

  /**
   * response of the endpoint
   * you can use zod `transform` to transform the value of the response before returning it
   */
  response: z.ZodType<R>
  /**
   * optional response status of the endpoint for sucess, default is 200
   * customize it if your endpoint returns a different status code and if you need openapi to generate the correct status code
   */
  status?: number
  /**
   * optional response description of the endpoint
   */
  responseDescription?: string

  errors?: Array<ZodiosEndpointError>
}

export type ZotchEndpointDefinitions<T extends string = string> = Record<T, ZotchEndpointDefinitionEntry>

export type ZotchRequestContext = {
  endpoint: ZotchEndpointDefinitionEntry
  request: ZotchRequestDto
}

export type ZotchResponseContext = ZotchRequestContext & {
  fetch: FetchPayload
  response: FetchResponse
}

export type ZotchRequestOptionsByAlias<Api extends ZotchEndpointDefinitions, Alias extends string> = Merge<
  SetPropsOptionalIfChildrenAreOptional<
    PickDefined<{
      params: ZodiosPathParamByAlias<Api, Alias>
      queries: ZodiosQueryParamsByAlias<Api, Alias>
      headers: ZodiosHeaderParamsByAlias<Api, Alias>
    }>
  >,
  Omit<ZotchRequest, 'params' | 'queries' | 'headers' | 'data' | 'method' | 'url'>
>

export type ZotchRequestOptions<Api extends ZotchEndpointDefinitions, Alias extends string> = Merge<
  {
    body?: BodySchemaByAlias<Api, Alias>
  },
  ZotchRequestOptionsByAlias<Api, Alias>
>
