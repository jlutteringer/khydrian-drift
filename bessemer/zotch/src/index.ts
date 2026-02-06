import * as Zotch from '@bessemer/zotch/zotch-api'
import * as OpenApi from '@bessemer/zotch/open-api'

export { type ZotchClient } from '@bessemer/zotch/zotch-client'
export { Zotch, OpenApi }

export type {
  ZotchRequest,
  ZodiosBodyForEndpoint,
  ZotchBodyByPath,
  ZodiosBodyByAlias,
  ZodiosHeaderParamsForEndpoint,
  ZodiosHeaderParamsByPath,
  ZodiosHeaderParamsByAlias,
  ZodiosPathParams,
  ZodiosPathParamsForEndpoint,
  ZodiosPathParamsByPath,
  ZodiosPathParamByAlias,
  ZotchPathsByMethod,
  ZodiosResponseForEndpoint,
  ZotchResponseByPath,
  ZodiosResponseByAlias,
  ZodiosQueryParamsForEndpoint,
  ZodiosQueryParamsByPath,
  ZodiosQueryParamsByAlias,
  ZodiosEndpointDefinitionByPath,
  ZodiosEndpointDefinitionByAlias,
  ZotchEndpointDefinition,
  ZotchEndpointDefinitions,
  ZodiosEndpointParameter,
  ZodiosEndpointParameters,
  ZodiosEndpointError,
  ZodiosEndpointErrors,
  ZotchOptions,
  ZotchRequestOptions,
  ZodiosMethodOptions,
  ZotchRequestOptionsByPath,
  ZodiosRequestOptionsByAlias,
  ZotchPlugin,
} from '@bessemer/zotch/zotch-types'
