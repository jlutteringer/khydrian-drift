import {
  Aliases,
  ZotchAliases,
  ZotchBodyByPath,
  ZotchEndpointDefinition,
  ZotchEndpointDefinitions,
  ZotchErrorTypeByPath,
  ZotchPathsByMethod,
  ZotchPayloadTypeByPath,
  ZotchPlugin,
  ZotchRequest,
  ZotchRequestOptions,
  ZotchRequestOptionsByPath,
  ZotchResponseByPath,
  ZotchResponseContext,
  ZotchResultByPath,
} from '@bessemer/zotch/zotch-types'
import { findEndpoint, findEndpointErrors, replacePathParams } from './zotch-utils'
import { ReadonlyDeep, RequiredKeys, UndefinedIfNever } from '@bessemer/zotch/zotch-type-utils'
import { PluginId, ZotchPlugins } from '@bessemer/zotch/plugins/zotch-plugins'
import { headerPlugin } from '@bessemer/zotch/plugins/header-plugin'
import { formDataPlugin } from '@bessemer/zotch/plugins/form-data-plugin'
import { Arrays, Assertions, Entries, Errors, Json, Objects, Results, Strings, Urls, ZodUtil } from '@bessemer/cornerstone'
import { AsyncResult } from '@bessemer/cornerstone/result'
import { HttpMethod } from '@bessemer/cornerstone/net/http-method'
import { FetchFunction, FetchPayload } from '@bessemer/cornerstone/net/fetch'
import { ZotchErrorType, ZotchRequestInvalidError, ZotchResponseInvalidError } from '@bessemer/zotch/zotch-error'
import Zod from 'zod'
import { formUrlPlugin } from '@bessemer/zotch/plugins/form-url-plugin'
import { validateEndpointDefinitions } from '@bessemer/zotch/zotch-api'

const ZotchClientPropsSchema = Zod.object({
  baseUrl: Zod.string().optional(),
  fetch: Zod.custom<FetchFunction>().default(fetch),
  sendDefaults: Zod.boolean().optional(),
})

export type ZotchClientProps = Zod.input<typeof ZotchClientPropsSchema>
export type ZotchClientPropsDto = Zod.output<typeof ZotchClientPropsSchema>

export class ZotchClientClass<Api extends ZotchEndpointDefinitions> {
  public readonly props: ZotchClientPropsDto
  public readonly api: Api
  private endpointPlugins: Map<string, ZotchPlugins> = new Map()

  constructor(api: Api, props?: ZotchClientProps) {
    validateEndpointDefinitions(api)

    this.api = api
    this.props = ZodUtil.defaults(props ?? {}, ZotchClientPropsSchema)

    this.injectAliasEndpoints()
    this.initPlugins()
  }

  private initPlugins() {
    this.endpointPlugins.set('any-any', new ZotchPlugins('any', 'any'))

    this.api.forEach((endpoint) => {
      const plugins = new ZotchPlugins(endpoint.method, endpoint.path)
      switch (endpoint.requestFormat) {
        case 'binary':
          plugins.use(headerPlugin('Content-Type', 'application/octet-stream'))
          break
        case 'form-data':
          plugins.use(formDataPlugin())
          break
        case 'form-url':
          plugins.use(formUrlPlugin())
          break
        case 'text':
          plugins.use(headerPlugin('Content-Type', 'text/plain'))
          break
      }
      this.endpointPlugins.set(`${endpoint.method}-${endpoint.path}`, plugins)
    })
  }

  private getAnyEndpointPlugins() {
    return this.endpointPlugins.get('any-any')
  }

  private findAliasEndpointPlugins(alias: string) {
    const endpoint = this.api.find((endpoint) => endpoint.alias === alias)
    if (Objects.isPresent(endpoint)) {
      return this.endpointPlugins.get(`${endpoint.method}-${endpoint.path}`)
    }
    return undefined
  }

  private findEnpointPlugins(method: HttpMethod, path: string) {
    return this.endpointPlugins.get(`${method}-${path}`)
  }

  use(plugin: ZotchPlugin): PluginId
  use<Alias extends Aliases<Api>>(alias: Alias, plugin: ZotchPlugin): PluginId
  use<M extends HttpMethod, Path extends ZotchPathsByMethod<Api, M>>(method: M, path: Path, plugin: ZotchPlugin): PluginId
  use(...args: unknown[]) {
    if (typeof args[0] === 'object') {
      const plugins = this.getAnyEndpointPlugins()!
      return plugins.use(args[0] as ZotchPlugin)
    } else if (typeof args[0] === 'string' && typeof args[1] === 'object') {
      const plugins = this.findAliasEndpointPlugins(args[0])
      if (!plugins) {
        throw new Error(`Zotch: no alias '${args[0]}' found to register plugin`)
      }
      return plugins.use(args[1] as ZotchPlugin)
    } else if (typeof args[0] === 'string' && typeof args[1] === 'string' && typeof args[2] === 'object') {
      const plugins = this.findEnpointPlugins(args[0] as HttpMethod, args[1])
      if (!plugins) {
        throw new Error(`Zotch: no endpoint '${args[0]} ${args[1]}' found to register plugin`)
      }
      return plugins.use(args[2] as ZotchPlugin)
    }
    throw new Error('Zotch: invalid plugin registration')
  }

  private injectAliasEndpoints() {
    this.api.forEach((endpoint) => {
      if (endpoint.alias) {
        if (['post', 'put', 'patch', 'delete'].includes(endpoint.method)) {
          ;(this as any)[endpoint.alias] = (body: any, config: any) =>
            this.request({
              ...config,
              method: endpoint.method,
              url: endpoint.path,
              body,
            })
        } else {
          ;(this as any)[endpoint.alias] = (config: any) =>
            this.request({
              ...config,
              method: endpoint.method,
              url: endpoint.path,
            })
        }
      }
    })
  }

  async request<M extends HttpMethod, Path extends string>(
    initialRequest: Path extends ZotchPathsByMethod<Api, M>
      ? ReadonlyDeep<ZotchRequestOptions<Api, M, Path>>
      : ReadonlyDeep<ZotchRequestOptions<Api, M, ZotchPathsByMethod<Api, M>>>
  ): Promise<ZotchResultByPath<Api, M, Path>> {
    let request = initialRequest as unknown as ZotchRequest
    const anyPlugin = this.getAnyEndpointPlugins()!
    const endpointPlugin = this.findEnpointPlugins(request.method, request.url)

    const endpoint = findEndpoint(this.api, request.method, request.url)
    Assertions.assertPresent(endpoint, () => `No endpoint found for ${request.method} ${request.url}`)

    const validatedRequest = await validateRequest(endpoint, request)
    if (!validatedRequest.isSuccess) {
      return validatedRequest
    }
    request = validatedRequest.value

    const anyPluginResult = await anyPlugin.interceptRequest({ endpoint, request })
    if (!anyPluginResult.isSuccess) {
      return anyPluginResult
    }
    request = anyPluginResult.value

    if (Objects.isPresent(endpointPlugin)) {
      const endpointPluginResult = await endpointPlugin.interceptRequest({ endpoint, request })
      if (!endpointPluginResult.isSuccess) {
        return endpointPluginResult
      }

      request = endpointPluginResult.value
    }

    let response: ZotchResultByPath<Api, M, Path>

    const { baseUrl, url, params, queries, body, ...fetchOptions } = request

    const base = Urls.from(request.baseUrl ?? this.props.baseUrl ?? '')

    // JOHN how to handle arrays of params? and does just calling toString on the value here present a robust solution...
    const queryParams = Object.fromEntries(Object.entries(queries ?? {}).map(([key, value]) => Entries.of(key, `${value}`)))

    Urls.merge(Urls.from(replacePathParams(url, params)), { location: { parameters: queryParams } })

    const urlLiteral = Urls.toLiteral(Urls.merge(Urls.from(replacePathParams(url, params)), { location: { parameters: queryParams } }))

    const fetchPayload: FetchPayload = {
      ...fetchOptions,
      url: urlLiteral,
      body: JSON.stringify(request.body),
      headers: request.headers,
    }

    try {
      const fetchResponse = await this.props.fetch(fetchPayload.url, fetchPayload)

      const responseContext: ZotchResponseContext = {
        endpoint,
        request,
        fetch: fetchPayload,
        response: fetchResponse,
      }

      if (fetchResponse.ok) {
        response = await validateSuccessResponse(responseContext)
      } else {
        const validatedError = await validateErrorResponse(responseContext)
        if (validatedError.isSuccess) {
          if (Objects.isNil(validatedError.value)) {
            response = Results.failure({
              type: ZotchErrorType.Unstructured,
              ...responseContext,
            })
          } else {
            response = Results.failure({
              type: ZotchErrorType.Structured,
              ...responseContext,
              ...validatedError.value,
            })
          }
        } else {
          response = validatedError
        }
      }
    } catch (e) {
      Errors.assertError(e)

      response = Results.failure({
        type: ZotchErrorType.FetchFailed,
        endpoint,
        request,
        fetch: fetchPayload,
        cause: e,
      })
    }

    // JOHN
    // if (Objects.isPresent(endpointPlugin)) {
    //   response = await endpointPlugin.interceptResponse(this.api, request, response)
    // }
    //
    // response = await anyPlugin.interceptResponse(this.api, request, response)
    return response
  }

  async get<Path extends ZotchPathsByMethod<Api, 'get'>, TConfig extends ZotchRequestOptionsByPath<Api, 'get', Path>>(
    path: Path,
    ...[config]: RequiredKeys<TConfig> extends never ? [config?: ReadonlyDeep<TConfig>] : [config: ReadonlyDeep<TConfig>]
  ): Promise<ZotchResponseByPath<Api, 'get', Path>> {
    return this.request({
      ...config,
      method: 'get',
      url: path,
    } as any)
  }

  async post<Path extends ZotchPathsByMethod<Api, 'post'>, TConfig extends ZotchRequestOptionsByPath<Api, 'post', Path>>(
    path: Path,
    data: ReadonlyDeep<UndefinedIfNever<ZotchBodyByPath<Api, 'post', Path>>>,
    ...[config]: RequiredKeys<TConfig> extends never ? [config?: ReadonlyDeep<TConfig>] : [config: ReadonlyDeep<TConfig>]
  ): Promise<ZotchResponseByPath<Api, 'post', Path>> {
    return this.request({
      ...config,
      method: 'post',
      url: path,
      data,
    } as any)
  }

  async put<Path extends ZotchPathsByMethod<Api, 'put'>, TConfig extends ZotchRequestOptionsByPath<Api, 'put', Path>>(
    path: Path,
    data: ReadonlyDeep<UndefinedIfNever<ZotchBodyByPath<Api, 'put', Path>>>,
    ...[config]: RequiredKeys<TConfig> extends never ? [config?: ReadonlyDeep<TConfig>] : [config: ReadonlyDeep<TConfig>]
  ): Promise<ZotchResponseByPath<Api, 'put', Path>> {
    return this.request({
      ...config,
      method: 'put',
      url: path,
      data,
    } as any)
  }

  async patch<Path extends ZotchPathsByMethod<Api, 'patch'>, TConfig extends ZotchRequestOptionsByPath<Api, 'patch', Path>>(
    path: Path,
    data: ReadonlyDeep<UndefinedIfNever<ZotchBodyByPath<Api, 'patch', Path>>>,
    ...[config]: RequiredKeys<TConfig> extends never ? [config?: ReadonlyDeep<TConfig>] : [config: ReadonlyDeep<TConfig>]
  ): Promise<ZotchResponseByPath<Api, 'patch', Path>> {
    return this.request({
      ...config,
      method: 'patch',
      url: path,
      data,
    } as any)
  }

  async delete<Path extends ZotchPathsByMethod<Api, 'delete'>, TConfig extends ZotchRequestOptionsByPath<Api, 'delete', Path>>(
    path: Path,
    data: ReadonlyDeep<UndefinedIfNever<ZotchBodyByPath<Api, 'delete', Path>>>,
    ...[config]: RequiredKeys<TConfig> extends never ? [config?: ReadonlyDeep<TConfig>] : [config: ReadonlyDeep<TConfig>]
  ): Promise<ZotchResponseByPath<Api, 'delete', Path>> {
    return this.request({
      ...config,
      method: 'delete',
      url: path,
      data,
    } as any)
  }
}

export type ZotchClient<Api extends ZotchEndpointDefinitions> = ZotchClientClass<Api> & ZotchAliases<Api>
export type ApiOf<Z> = Z extends ZotchClient<infer Api> ? Api : never

const validateRequest = async (endpoint: ZotchEndpointDefinition, request: ZotchRequest): AsyncResult<ZotchRequest, ZotchRequestInvalidError> => {
  const { parameters } = endpoint
  if (Objects.isNil(parameters)) {
    return Results.success(request)
  }

  const conf = {
    ...request,
    queries: {
      ...request.queries,
    },
    headers: {
      ...request.headers,
    },
    params: {
      ...request.params,
    },
  }

  const paramsOf = {
    Query: (name: string) => conf.queries?.[name],
    Body: (_: string) => conf.body,
    Header: (name: string) => conf.headers?.[name],
    Path: (name: string) => conf.params?.[name],
  }

  const setParamsOf = {
    Query: (name: string, value: any) => (conf.queries![name] = value),
    Body: (_: string, value: any) => (conf.body = value),
    Header: (name: string, value: any) => (conf.headers![name] = value),
    Path: (name: string, value: any) => (conf.params![name] = value),
  }

  for (const parameter of parameters) {
    const { name, schema, type } = parameter
    const value = paramsOf[type](name)

    const parsed = await schema.safeParseAsync(value)
    if (!parsed.success) {
      return Results.failure({
        type: ZotchErrorType.RequestInvalid,
        message: `Zotch: Invalid ${type} parameter '${name}'`,
        endpoint,
        request,
        value,
        cause: parsed.error,
      })
    }

    setParamsOf[type](name, parsed.data)
  }

  return Results.success(conf)
}

const validateSuccessResponse = async <Api extends ZotchEndpointDefinitions, M extends HttpMethod, Path extends string>(
  context: ZotchResponseContext
): AsyncResult<ZotchPayloadTypeByPath<Api, M, Path>, ZotchResponseInvalidError> => {
  const { endpoint, response } = context
  const body = await response.text()
  const jsonResult = Json.parse(body)
  if (!jsonResult.isSuccess) {
    return Results.failure({
      type: ZotchErrorType.ResponseInvalid,
      ...context,
      message: `Zotch: Unable to parse JSON from endpoint '${endpoint.method} ${endpoint.path}'\nstatus: ${response.status} ${response.statusText}\ncause:\n${jsonResult.value.message}\nreceived:\n${body}`,
      value: body,
      cause: jsonResult.value,
    })
  }

  const parseResult = await ZodUtil.parseAsync(endpoint.response, jsonResult.value)
  if (!parseResult.isSuccess) {
    return Results.failure({
      type: ZotchErrorType.ResponseInvalid,
      ...context,
      message: `Zotch: Invalid response from endpoint '${endpoint.method} ${endpoint.path}'\nstatus: ${response.status} ${
        response.statusText
      }\ncause:\n${parseResult.value.message}\nreceived:\n${JSON.stringify(jsonResult.value, null, 2)}`,
      value: jsonResult.value,
      cause: parseResult.value,
    })
  }

  return Results.success(parseResult.value as ZotchPayloadTypeByPath<Api, M, Path>)
}

const validateErrorResponse = async <Api extends ZotchEndpointDefinitions, M extends HttpMethod, Path extends string>(
  context: ZotchResponseContext
): AsyncResult<ZotchErrorTypeByPath<Api, M, Path> | null, ZotchResponseInvalidError> => {
  const { endpoint, response } = context
  const endpointErrors = findEndpointErrors(endpoint, response)
  if (Arrays.isEmpty(endpointErrors)) {
    return Results.success(null)
  }

  const body = await response.text()
  let jsonValue = undefined

  if (!Strings.isEmpty(body)) {
    const jsonResult = Json.parse(body)
    if (!jsonResult.isSuccess) {
      return Results.failure({
        type: ZotchErrorType.ResponseInvalid,
        ...context,
        message: `Zotch: Unable to parse JSON from endpoint '${endpoint.method} ${endpoint.path}'\nstatus: ${response.status} ${response.statusText}\ncause:\n${jsonResult.value.message}\nreceived:\n${body}`,
        value: body,
        cause: jsonResult.value,
      })
    }

    jsonValue = jsonResult.value
  }

  const endpointErrorUnion = Zod.union(endpointErrors.map((it) => it.schema))
  const parseResult = await ZodUtil.parseAsync(endpointErrorUnion, body)

  if (!parseResult.isSuccess) {
    return Results.failure({
      type: ZotchErrorType.ResponseInvalid,
      ...context,
      message: `Zotch: Invalid response from endpoint '${endpoint.method} ${endpoint.path}'\nstatus: ${response.status} ${
        response.statusText
      }\ncause:\n${parseResult.value.message}\nreceived:\n${JSON.stringify(jsonValue, null, 2)}`,
      value: jsonValue,
      cause: parseResult.value,
    })
  }

  return Results.success({ status: response.status, value: parseResult.value } as ZotchErrorTypeByPath<Api, M, Path>)
}
