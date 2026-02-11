import type {
  FilterArrayByKey,
  FilterArrayByValue,
  MapSchemaParameters,
  Merge,
  NeverIfEmpty,
  PathParamNames,
  PickDefined,
  ReadonlyDeep,
  RequiredKeys,
  SetPropsOptionalIfChildrenAreOptional,
  Simplify,
  UndefinedIfNever,
  UndefinedToOptional,
} from '@bessemer/zotch/zotch-type-utils'
import z from 'zod'
import { AsyncResult, Result } from '@bessemer/cornerstone/result'
import { ZotchError, ZotchRequestInvalidError } from '@bessemer/zotch/zotch-error'
import { HttpMethod } from '@bessemer/cornerstone/net/http-method'
import { FetchPayload, FetchRequest, FetchResponse } from '@bessemer/cornerstone/net/fetch'
import { SetRequired } from 'type-fest'

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

type EndpointDefinitionsByMethod<Api extends ZotchEndpointDefinition[], M extends HttpMethod> = FilterArrayByValue<Api, { method: M }>

export type ZodiosEndpointDefinitionByPath<
  Api extends ZotchEndpointDefinition[],
  M extends HttpMethod,
  Path extends ZotchPathsByMethod<Api, M>
> = FilterArrayByValue<Api, { method: M; path: Path }>

export type ZodiosEndpointDefinitionByAlias<Api extends Array<ZotchEndpointDefinition>, Alias extends string> = FilterArrayByValue<
  Api,
  { alias: Alias }
>

export type ZotchPathsByMethod<Api extends Array<ZotchEndpointDefinition>, M extends HttpMethod> = EndpointDefinitionsByMethod<Api, M>[number]['path']

export type Aliases<Api extends Array<ZotchEndpointDefinition>> = FilterArrayByKey<Api, 'alias'>[number]['alias']

export type ZodiosResponseForEndpoint<Endpoint extends ZotchEndpointDefinition, Frontend extends boolean = true> = Frontend extends true
  ? Result<z.output<Endpoint['response']>, ZotchError>
  : Result<z.input<Endpoint['response']>, ZotchError>

export type ZotchPayloadTypeByPath<
  Api extends Array<ZotchEndpointDefinition>,
  M extends HttpMethod,
  Path extends ZotchPathsByMethod<Api, M>
> = z.output<ZodiosEndpointDefinitionByPath<Api, M, Path>[number]['response']>

export type ZotchErrorTypeByPath<
  Api extends Array<ZotchEndpointDefinition>,
  M extends HttpMethod,
  Path extends ZotchPathsByMethod<Api, M>,
  ExpandType extends boolean = true
> = ExpandType extends true
  ? {
      status: NonNullable<ZodiosEndpointDefinitionByPath<Api, M, Path>[number]['errors']>[number]['status']
      value: z.output<NonNullable<ZodiosEndpointDefinitionByPath<Api, M, Path>[number]['errors']>[number]['schema']>
    }
  : never

export type ZotchResultByPath<
  Api extends Array<ZotchEndpointDefinition>,
  M extends HttpMethod,
  Path extends ZotchPathsByMethod<Api, M>,
  ExpandType extends boolean = true
> = ExpandType extends true ? Result<ZotchPayloadTypeByPath<Api, M, Path>, ZotchError<ZotchErrorTypeByPath<Api, M, Path>>> : never

export type ZotchResponseByPath<
  Api extends Array<ZotchEndpointDefinition>,
  M extends HttpMethod,
  Path extends ZotchPathsByMethod<Api, M>,
  ExpandType extends boolean = true
> = ExpandType extends true ? ZotchResultByPath<Api, M, Path> : never

export type ZodiosErrorTypeByAlias<Api extends Array<ZotchEndpointDefinition>, Alias extends string> = NonNullable<
  ZodiosEndpointDefinitionByAlias<Api, Alias>[number]['errors']
>[number] extends infer E
  ? E extends ZodiosEndpointError
    ? {
        status: E['status']
        value: z.output<E['schema']>
      }
    : never
  : never

export type ZodiosResponseByAlias<
  Api extends Array<ZotchEndpointDefinition>,
  Alias extends string,
  ExpandType extends boolean = true
> = ExpandType extends true
  ? Result<z.output<ZodiosEndpointDefinitionByAlias<Api, Alias>[number]['response']>, ZotchError<ZodiosErrorTypeByAlias<Api, Alias>>>
  : never

// export type ZodiosDefaultErrorForEndpoint<Endpoint extends ZodiosEndpointDefinition> = FilterArrayByValue<
//   Endpoint['errors'],
//   {
//     status: 'default'
//   }
// >[number]['schema']
//
// type ZodiosDefaultErrorByPath<
//   Api extends Array<ZodiosEndpointDefinition>,
//   M extends HttpMethod,
//   Path extends ZodiosPathsByMethod<Api, M>
// > = FilterArrayByValue<
//   ZodiosEndpointDefinitionByPath<Api, M, Path>[number]['errors'],
//   {
//     status: 'default'
//   }
// >[number]['schema']
//
// type ZodiosDefaultErrorByAlias<Api extends Array<ZodiosEndpointDefinition>, Alias extends string> = FilterArrayByValue<
//   ZodiosEndpointDefinitionByAlias<Api, Alias>[number]['errors'],
//   {
//     status: 'default'
//   }
// >[number]['schema']
//
// type IfNever<E, A> = IfEquals<E, never, A, E>

// export type ZodiosErrorForEndpoint<
//   Endpoint extends ZodiosEndpointDefinition,
//   Status extends number,
//   Frontend extends boolean = true
// > = Frontend extends true
//   ? z.output<
//       IfNever<
//         FilterArrayByValue<
//           Endpoint['errors'],
//           {
//             status: Status
//           }
//         >[number]['schema'],
//         ZodiosDefaultErrorForEndpoint<Endpoint>
//       >
//     >
//   : z.input<
//       IfNever<
//         FilterArrayByValue<
//           Endpoint['errors'],
//           {
//             status: Status
//           }
//         >[number]['schema'],
//         ZodiosDefaultErrorForEndpoint<Endpoint>
//       >
//     >

// export type ZodiosErrorResponseByPath<
//   Api extends Array<ZodiosEndpointDefinition>,
//   M extends HttpMethod,
//   Path extends ZodiosPathsByMethod<Api, M>,
//   Status extends number,
//   Frontend extends boolean = true
// > = Frontend extends true
//   ? z.output<
//       IfNever<
//         FilterArrayByValue<
//           ZodiosEndpointDefinitionByPath<Api, M, Path>[number]['errors'],
//           {
//             status: Status
//           }
//         >[number]['schema'],
//         ZodiosDefaultErrorByPath<Api, M, Path>
//       >
//     >
//   : z.input<
//       IfNever<
//         FilterArrayByValue<
//           ZodiosEndpointDefinitionByPath<Api, M, Path>[number]['errors'],
//           {
//             status: Status
//           }
//         >[number]['schema'],
//         ZodiosDefaultErrorByPath<Api, M, Path>
//       >
//     >

// JOHN
// export type AxiosError<T = unknown> = {
//   response: T
// }
//
// export type ZodiosErrorByAlias<
//   Api extends Array<ZodiosEndpointDefinition>,
//   Alias extends string,
//   Status extends number,
//   Frontend extends boolean = true
// > = Frontend extends true
//   ? z.output<
//       IfNever<
//         FilterArrayByValue<
//           ZodiosEndpointDefinitionByAlias<Api, Alias>[number]['errors'],
//           {
//             status: Status
//           }
//         >[number]['schema'],
//         ZodiosDefaultErrorByAlias<Api, Alias>
//       >
//     >
//   : z.input<
//       IfNever<
//         FilterArrayByValue<
//           ZodiosEndpointDefinitionByAlias<Api, Alias>[number]['errors'],
//           {
//             status: Status
//           }
//         >[number]['schema'],
//         ZodiosDefaultErrorByAlias<Api, Alias>
//       >
//     >

export type BodySchemaForEndpoint<Endpoint extends ZotchEndpointDefinition> = NonNullable<Endpoint['body']>['schema']

export type BodySchema<Api extends Array<ZotchEndpointDefinition>, M extends HttpMethod, Path extends ZotchPathsByMethod<Api, M>> = NonNullable<
  ZodiosEndpointDefinitionByPath<Api, M, Path>[number]['body']
>['schema']

export type ZodiosBodyForEndpoint<Endpoint extends ZotchEndpointDefinition, Frontend extends boolean = true> = Frontend extends true
  ? z.input<BodySchemaForEndpoint<Endpoint>>
  : z.output<BodySchemaForEndpoint<Endpoint>>

export type ZotchBodyByPath<
  Api extends Array<ZotchEndpointDefinition>,
  M extends HttpMethod,
  Path extends ZotchPathsByMethod<Api, M>,
  Frontend extends boolean = true
> = Frontend extends true ? z.input<BodySchema<Api, M, Path>> : z.output<BodySchema<Api, M, Path>>

export type BodySchemaByAlias<Api extends Array<ZotchEndpointDefinition>, Alias extends string> = NonNullable<
  ZodiosEndpointDefinitionByAlias<Api, Alias>[number]['body']
>['schema']

export type ZodiosBodyByAlias<
  Api extends Array<ZotchEndpointDefinition>,
  Alias extends string,
  Frontend extends boolean = true
> = Frontend extends true ? z.input<BodySchemaByAlias<Api, Alias>> : z.output<BodySchemaByAlias<Api, Alias>>

export type ZodiosQueryParamsForEndpoint<Endpoint extends ZotchEndpointDefinition, Frontend extends boolean = true> = NeverIfEmpty<
  UndefinedToOptional<MapSchemaParameters<Endpoint['queries'], Frontend>>
>

export type ZodiosQueryParamsByPath<
  Api extends Array<ZotchEndpointDefinition>,
  M extends HttpMethod,
  Path extends ZotchPathsByMethod<Api, M>,
  Frontend extends boolean = true
> = NeverIfEmpty<UndefinedToOptional<MapSchemaParameters<ZodiosEndpointDefinitionByPath<Api, M, Path>[number]['queries'], Frontend>>>

export type ZodiosQueryParamsByAlias<
  Api extends Array<ZotchEndpointDefinition>,
  Alias extends string,
  Frontend extends boolean = true
> = NeverIfEmpty<UndefinedToOptional<MapSchemaParameters<ZodiosEndpointDefinitionByAlias<Api, Alias>[number]['queries'], Frontend>>>

/**
 * @deprecated - use ZodiosQueryParamsByPath instead
 */
export type ZodiosPathParams<Path extends string> = NeverIfEmpty<Record<PathParamNames<Path>, string | number>>

export type ZodiosPathParamsForEndpoint<
  Endpoint extends ZotchEndpointDefinition,
  Frontend extends boolean = true,
  PathParameters = UndefinedToOptional<MapSchemaParameters<Endpoint['params'], Frontend>>
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
 * Get path params for a given endpoint by path
 */
export type ZodiosPathParamsByPath<
  Api extends Array<ZotchEndpointDefinition>,
  M extends HttpMethod,
  Path extends ZotchPathsByMethod<Api, M>,
  Frontend extends boolean = true,
  PathParameters = UndefinedToOptional<MapSchemaParameters<ZodiosEndpointDefinitionByPath<Api, M, Path>[number]['params'], Frontend>>,
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

/**
 * Get path params for a given endpoint by alias
 */
export type ZodiosPathParamByAlias<
  Api extends Array<ZotchEndpointDefinition>,
  Alias extends string,
  Frontend extends boolean = true,
  EndpointDefinition extends ZotchEndpointDefinition = ZodiosEndpointDefinitionByAlias<Api, Alias>[number],
  Path = EndpointDefinition['path'],
  PathParameters = UndefinedToOptional<MapSchemaParameters<EndpointDefinition['params'], Frontend>>,
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

export type ZodiosHeaderParamsForEndpoint<Endpoint extends ZotchEndpointDefinition, Frontend extends boolean = true> = NeverIfEmpty<
  UndefinedToOptional<MapSchemaParameters<Endpoint['headers'], Frontend>>
>

export type ZodiosHeaderParamsByPath<
  Api extends Array<ZotchEndpointDefinition>,
  M extends HttpMethod,
  Path extends ZotchPathsByMethod<Api, M>,
  Frontend extends boolean = true
> = NeverIfEmpty<UndefinedToOptional<MapSchemaParameters<ZodiosEndpointDefinitionByPath<Api, M, Path>[number]['headers'], Frontend>>>

export type ZodiosHeaderParamsByAlias<
  Api extends Array<ZotchEndpointDefinition>,
  Alias extends string,
  Frontend extends boolean = true
> = NeverIfEmpty<UndefinedToOptional<MapSchemaParameters<ZodiosEndpointDefinitionByAlias<Api, Alias>[number]['headers'], Frontend>>>

export type ZodiosRequestOptionsByAlias<Api extends Array<ZotchEndpointDefinition>, Alias extends string> = Merge<
  SetPropsOptionalIfChildrenAreOptional<
    PickDefined<{
      params: ZodiosPathParamByAlias<Api, Alias>
      queries: ZodiosQueryParamsByAlias<Api, Alias>
      headers: ZodiosHeaderParamsByAlias<Api, Alias>
    }>
  >,
  Omit<ZotchRequest, 'params' | 'baseURL' | 'data' | 'method' | 'url'>
>

export type ZodiosMutationAliasRequest<Body, Config, Response> = RequiredKeys<Config> extends never
  ? (body: ReadonlyDeep<UndefinedIfNever<Body>>, configOptions?: ReadonlyDeep<Config>) => Promise<Response>
  : (body: ReadonlyDeep<UndefinedIfNever<Body>>, configOptions: ReadonlyDeep<Config>) => Promise<Response>

export type ZodiosAliasRequest<Config, Response> = RequiredKeys<Config> extends never
  ? (configOptions?: ReadonlyDeep<Config>) => Promise<Response>
  : (configOptions: ReadonlyDeep<Config>) => Promise<Response>

export type ZotchAliases<Api extends Array<ZotchEndpointDefinition>> = {
  [Alias in Aliases<Api>]: ZodiosEndpointDefinitionByAlias<Api, Alias>[number]['method'] extends MutationMethod
    ? ZodiosMutationAliasRequest<ZodiosBodyByAlias<Api, Alias>, ZodiosRequestOptionsByAlias<Api, Alias>, ZodiosResponseByAlias<Api, Alias>>
    : ZodiosAliasRequest<ZodiosRequestOptionsByAlias<Api, Alias>, ZodiosResponseByAlias<Api, Alias>>
}

/**
 * Get the request options for a given endpoint
 */
export type ZotchRequestOptionsByPath<
  Api extends Array<ZotchEndpointDefinition>,
  M extends HttpMethod,
  Path extends ZotchPathsByMethod<Api, M>
> = Merge<
  SetPropsOptionalIfChildrenAreOptional<
    PickDefined<{
      params: ZodiosPathParamsByPath<Api, M, Path>
      queries: ZodiosQueryParamsByPath<Api, M, Path>
      headers: ZodiosHeaderParamsByPath<Api, M, Path>
    }>
  >,
  Omit<ZotchRequest, 'params' | 'baseURL' | 'data' | 'method' | 'url'>
>

export type ZotchRequestOptions<Api extends Array<ZotchEndpointDefinition>, M extends HttpMethod, Path extends ZotchPathsByMethod<Api, M>> = Merge<
  {
    method: M
    url: Path
    data?: ZotchBodyByPath<Api, M, Path>
  },
  ZotchRequestOptionsByPath<Api, M, Path>
>

export type ZodiosBodyParameter<T = unknown> = {
  /**
   * name of the parameter
   */
  name: string

  /**
   * optional description of the parameter
   */
  description?: string

  /**
   * zod schema of the parameter
   * you can use zod `transform` to transform the value of the parameter before sending it to the server
   */
  schema: z.ZodType<T>
}

export type ZodiosEndpointParameter<T = unknown> = {
  /**
   * name of the parameter
   */
  name: string
  /**
   * optional description of the parameter
   */
  description?: string
  /**
   * type of the parameter: Query, Body, Header, Path
   */
  type: 'Path'
  /**
   * zod schema of the parameter
   * you can use zod `transform` to transform the value of the parameter before sending it to the server
   */
  schema: z.ZodType<T>
}

export type ZodiosEndpointParameters = Array<ZodiosEndpointParameter>

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

export type ZodiosEndpointErrors = Array<ZodiosEndpointError>

/**
 * Zodios enpoint definition that should be used to create a new instance of Zodios
 */
export interface ZotchEndpointDefinition<R = unknown> {
  alias: string
  method: HttpMethod
  path: string
  description?: string
  /**
   * optional request format of the endpoint: json, form-data, form-url, binary, text
   */
  requestFormat?: RequestFormat

  body?: ZodiosBodyParameter
  headers?: Array<ZodiosBodyParameter>
  queries?: Array<ZodiosBodyParameter>
  params?: Array<ZodiosBodyParameter>

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

export type ZotchEndpointDefinitions = Array<ZotchEndpointDefinition>

export type ZotchRequestContext = {
  endpoint: ZotchEndpointDefinition
  request: ZotchRequestDto
}

export type ZotchResponseContext = ZotchRequestContext & {
  fetch: FetchPayload
  response: FetchResponse
}

export type ZotchPlugin = {
  name?: string
  processRequest?: (context: ZotchRequestContext) => AsyncResult<ZotchRequestDto, ZotchRequestInvalidError>
  processResponse?: <T>(response: Result<T, ZotchError>, context: ZotchResponseContext) => AsyncResult<T, ZotchError>
}
