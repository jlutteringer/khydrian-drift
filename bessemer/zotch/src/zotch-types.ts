import type {
  Merge,
  NeverIfEmpty,
  PathParamNames,
  PickDefined,
  RequiredKeys,
  SetPropsOptionalIfChildrenAreOptional,
  Simplify,
} from '@bessemer/zotch/zotch-type-utils'
import z from 'zod'
import Zod, { ZodType } from 'zod'
import { Result } from '@bessemer/cornerstone/result'
import { ZotchError } from '@bessemer/zotch/zotch-error'
import { HttpMethod } from '@bessemer/cornerstone/net/http-method'
import { FetchPayload, FetchRequest, FetchResponse } from '@bessemer/cornerstone/net/fetch'
import { PartialOnUndefinedDeep, SetRequired } from 'type-fest'
import { Dictionary } from '@bessemer/cornerstone/types'
import { MimeLiteral } from '@bessemer/cornerstone/mime-type'

export type ZotchRequest<D = any> = Omit<FetchRequest, 'body' | 'method' | 'headers'> & {
  baseUrl?: string
  url: string
  method: HttpMethod
  params?: Record<string, unknown>
  queries?: Record<string, unknown>
  headers?: Record<string, string>
} & (undefined extends D ? { body?: D } : { body: D })

export type ZotchRequestDto<D = any> = SetRequired<ZotchRequest, 'params' | 'method' | 'headers'>

export type ResponseType = 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream' | 'formdata'

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

export type ZotchRequestByAlias<Api extends ZotchEndpointDefinitions, Alias extends string> = Merge<
  SetPropsOptionalIfChildrenAreOptional<
    PickDefined<{
      params: ZodiosPathParamByAlias<Api, Alias>
      queries: ZodiosQueryParamsByAlias<Api, Alias>
      headers: ZodiosHeaderParamsByAlias<Api, Alias>
    }>
  >,
  Omit<ZotchRequest<ZodiosBodyByAlias<Api, Alias>>, 'params' | 'queries' | 'headers' | 'method' | 'url'>
>

type ZotchAliasRequest<RequestType, ResponseType> = RequiredKeys<RequestType> extends never
  ? (request?: RequestType) => Promise<ResponseType>
  : (request: RequestType) => Promise<ResponseType>

export type ZotchAliases<Api extends ZotchEndpointDefinitions> = {
  [Alias in Aliases<Api>]: ZotchAliasRequest<ZotchRequestByAlias<Api, Alias>, ZotchResponseByAlias<Api, Alias>>
}

export type ZodiosEndpointError<T = unknown> = {
  status: number
  schema: z.ZodType<T>
}

export interface ZotchEndpointDefinitionEntry<R = unknown> {
  method: HttpMethod
  path: string
  description?: string
  requestFormat?: MimeLiteral

  body?: ZodType
  headers?: Dictionary<ZodType>
  queries?: Dictionary<ZodType>
  params?: Dictionary<ZodType>
  response: z.ZodType<R>

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
