import {
  Aliases,
  AnyZodiosRequestOptions,
  FetchFunction,
  ZodiosAliases,
  ZodiosBodyByPath,
  ZodiosEndpointDefinitions,
  ZodiosOptions,
  ZodiosParsedErrorByPath,
  ZodiosParsedPayloadByPath,
  ZodiosPathsByMethod,
  ZodiosPlugin,
  ZodiosRequestOptions,
  ZodiosRequestOptionsByPath,
  ZodiosResponseByPath,
} from '@bessemer/zodios/types'
import { findEndpoint, findEndpointErrorsByPath, replacePathParams } from './utils'
import { Narrow, PickRequired, ReadonlyDeep, RequiredKeys, UndefinedIfNever } from '@bessemer/zodios/utils.types'
import { checkApi } from '@bessemer/zodios/api'
import { PluginId, ZodiosPlugins } from '@bessemer/zodios/plugins/zodios-plugins'
import { headerPlugin } from '@bessemer/zodios/plugins/header.plugin'
import { formDataPlugin } from '@bessemer/zodios/plugins/form-data.plugin'
import { formURLPlugin } from '@bessemer/zodios/plugins/form-url.plugin'
import { Entries, Errors, Objects, Results, Urls } from '@bessemer/cornerstone'
import { AsyncResult, Result } from '@bessemer/cornerstone/result'
import { ZodiosFetchError, ZodiosValidationError } from '@bessemer/zodios/zodios-error'
import { HttpMethod } from '@bessemer/cornerstone/net/http-method'
import { AxiosError } from 'axios'
import { FetchResponse } from '@bessemer/cornerstone/net/fetch'

export class ZodiosClass<Api extends ZodiosEndpointDefinitions> {
  private fetch: FetchFunction
  public readonly options: PickRequired<ZodiosOptions, 'sendDefaults'>
  public readonly api: Api
  private endpointPlugins: Map<string, ZodiosPlugins> = new Map()

  constructor(api: Api, options?: ZodiosOptions) {
    checkApi(api)

    this.api = api

    this.options = {
      sendDefaults: false,
      ...options,
    }

    if (this.options.fetch) {
      this.fetch = this.options.fetch
    } else {
      this.fetch = fetch
    }

    this.injectAliasEndpoints()
    this.initPlugins()
  }

  private initPlugins() {
    this.endpointPlugins.set('any-any', new ZodiosPlugins('any', 'any'))

    this.api.forEach((endpoint) => {
      const plugins = new ZodiosPlugins(endpoint.method, endpoint.path)
      switch (endpoint.requestFormat) {
        case 'binary':
          plugins.use(headerPlugin('Content-Type', 'application/octet-stream'))
          break
        case 'form-data':
          plugins.use(formDataPlugin())
          break
        case 'form-url':
          plugins.use(formURLPlugin())
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
    if (endpoint) {
      return this.endpointPlugins.get(`${endpoint.method}-${endpoint.path}`)
    }
    return undefined
  }

  private findEnpointPlugins(method: HttpMethod, path: string) {
    return this.endpointPlugins.get(`${method}-${path}`)
  }

  use(plugin: ZodiosPlugin): PluginId
  use<Alias extends Aliases<Api>>(alias: Alias, plugin: ZodiosPlugin): PluginId
  use<M extends HttpMethod, Path extends ZodiosPathsByMethod<Api, M>>(method: M, path: Path, plugin: ZodiosPlugin): PluginId
  use(...args: unknown[]) {
    if (typeof args[0] === 'object') {
      const plugins = this.getAnyEndpointPlugins()!
      return plugins.use(args[0] as ZodiosPlugin)
    } else if (typeof args[0] === 'string' && typeof args[1] === 'object') {
      const plugins = this.findAliasEndpointPlugins(args[0])
      if (!plugins) throw new Error(`Zodios: no alias '${args[0]}' found to register plugin`)
      return plugins.use(args[1] as ZodiosPlugin)
    } else if (typeof args[0] === 'string' && typeof args[1] === 'string' && typeof args[2] === 'object') {
      const plugins = this.findEnpointPlugins(args[0] as HttpMethod, args[1])
      if (!plugins) throw new Error(`Zodios: no endpoint '${args[0]} ${args[1]}' found to register plugin`)
      return plugins.use(args[2] as ZodiosPlugin)
    }
    throw new Error('Zodios: invalid plugin registration')
  }

  private injectAliasEndpoints() {
    this.api.forEach((endpoint) => {
      if (endpoint.alias) {
        if (['post', 'put', 'patch', 'delete'].includes(endpoint.method)) {
          ;(this as any)[endpoint.alias] = (data: any, config: any) =>
            this.request({
              ...config,
              method: endpoint.method,
              url: endpoint.path,
              data,
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
    initialRequest: Path extends ZodiosPathsByMethod<Api, M>
      ? ReadonlyDeep<ZodiosRequestOptions<Api, M, Path>>
      : ReadonlyDeep<ZodiosRequestOptions<Api, M, ZodiosPathsByMethod<Api, M>>>
  ): Promise<ZodiosResponseByPath<Api, M, Path extends ZodiosPathsByMethod<Api, M> ? Path : never>> {
    let request = initialRequest as unknown as AnyZodiosRequestOptions
    const anyPlugin = this.getAnyEndpointPlugins()!
    const endpointPlugin = this.findEnpointPlugins(request.method, request.url)

    const validatedRequest = await validateRequest(this.api, request)
    if (!validatedRequest.isSuccess) {
      return validatedRequest
    }
    request = validatedRequest.value

    const anyPluginResult = await anyPlugin.interceptRequest(this.api, request)
    if (!anyPluginResult.isSuccess) {
      return anyPluginResult
    }
    request = anyPluginResult.value

    if (Objects.isPresent(endpointPlugin)) {
      const endpointPluginResult = await endpointPlugin.interceptRequest(this.api, request)
      if (!endpointPluginResult.isSuccess) {
        return endpointPluginResult
      }

      request = endpointPluginResult.value
    }

    let response: Result<ZodiosParsedPayloadByPath<Api, M, Path>, ZodiosParsedErrorByPath<Api, M, Path> | AxiosError | ZodiosValidationError>
    try {
      const { url, params, queries, body, ...fetchOptions } = request

      // JOHN how to handle arrays of params? and does just calling toString on the value here present a robust solution...
      const stringParams = Object.fromEntries(Object.entries(params ?? {}).map(([key, value]) => Entries.of(key, `${value}`)))
      const urlLiteral = Urls.toLiteral(Urls.merge(Urls.from(replacePathParams(url, params)), { location: { parameters: stringParams } }))

      const fetchResponse = await this.fetch(replacePathParams(urlLiteral, params), {
        ...fetchOptions,
        body: JSON.stringify(request.body),
        headers: request.headers,
      })

      if (fetchResponse.ok) {
        response = await validateSuccessResponse(this.api, request, fetchResponse)
      } else {
        const validatedError = await validateErrorResponse(this.api, request, fetchResponse)
        if (validatedError.isSuccess) {
          if (Objects.isNil(validatedError.value)) {
            response = Results.failure(e)
          } else {
            response = Results.failure(validatedError.value)
          }
        } else {
          response = Results.failure(e)
        }
      }
    } catch (e) {
      Errors.assertError(e)
      response = Results.failure(new ZodiosFetchError(e))
    }

    // JOHN
    // if (Objects.isPresent(endpointPlugin)) {
    //   response = await endpointPlugin.interceptResponse(this.api, request, response)
    // }
    //
    // response = await anyPlugin.interceptResponse(this.api, request, response)
    return response
  }

  async get<Path extends ZodiosPathsByMethod<Api, 'get'>, TConfig extends ZodiosRequestOptionsByPath<Api, 'get', Path>>(
    path: Path,
    ...[config]: RequiredKeys<TConfig> extends never ? [config?: ReadonlyDeep<TConfig>] : [config: ReadonlyDeep<TConfig>]
  ): Promise<ZodiosResponseByPath<Api, 'get', Path>> {
    return this.request({
      ...config,
      method: 'get',
      url: path,
    } as any)
  }

  async post<Path extends ZodiosPathsByMethod<Api, 'post'>, TConfig extends ZodiosRequestOptionsByPath<Api, 'post', Path>>(
    path: Path,
    data: ReadonlyDeep<UndefinedIfNever<ZodiosBodyByPath<Api, 'post', Path>>>,
    ...[config]: RequiredKeys<TConfig> extends never ? [config?: ReadonlyDeep<TConfig>] : [config: ReadonlyDeep<TConfig>]
  ): Promise<ZodiosResponseByPath<Api, 'post', Path>> {
    return this.request({
      ...config,
      method: 'post',
      url: path,
      data,
    } as any)
  }

  async put<Path extends ZodiosPathsByMethod<Api, 'put'>, TConfig extends ZodiosRequestOptionsByPath<Api, 'put', Path>>(
    path: Path,
    data: ReadonlyDeep<UndefinedIfNever<ZodiosBodyByPath<Api, 'put', Path>>>,
    ...[config]: RequiredKeys<TConfig> extends never ? [config?: ReadonlyDeep<TConfig>] : [config: ReadonlyDeep<TConfig>]
  ): Promise<ZodiosResponseByPath<Api, 'put', Path>> {
    return this.request({
      ...config,
      method: 'put',
      url: path,
      data,
    } as any)
  }

  async patch<Path extends ZodiosPathsByMethod<Api, 'patch'>, TConfig extends ZodiosRequestOptionsByPath<Api, 'patch', Path>>(
    path: Path,
    data: ReadonlyDeep<UndefinedIfNever<ZodiosBodyByPath<Api, 'patch', Path>>>,
    ...[config]: RequiredKeys<TConfig> extends never ? [config?: ReadonlyDeep<TConfig>] : [config: ReadonlyDeep<TConfig>]
  ): Promise<ZodiosResponseByPath<Api, 'patch', Path>> {
    return this.request({
      ...config,
      method: 'patch',
      url: path,
      data,
    } as any)
  }

  async delete<Path extends ZodiosPathsByMethod<Api, 'delete'>, TConfig extends ZodiosRequestOptionsByPath<Api, 'delete', Path>>(
    path: Path,
    data: ReadonlyDeep<UndefinedIfNever<ZodiosBodyByPath<Api, 'delete', Path>>>,
    ...[config]: RequiredKeys<TConfig> extends never ? [config?: ReadonlyDeep<TConfig>] : [config: ReadonlyDeep<TConfig>]
  ): Promise<ZodiosResponseByPath<Api, 'delete', Path>> {
    return this.request({
      ...config,
      method: 'delete',
      url: path,
      data,
    } as any)
  }
}

export type ZodiosInstance<Api extends ZodiosEndpointDefinitions> = ZodiosClass<Api> & ZodiosAliases<Api>

export type ZodiosConstructor = {
  new <Api extends ZodiosEndpointDefinitions>(api: Narrow<Api>, options?: ZodiosOptions): ZodiosInstance<Api>
  new <Api extends ZodiosEndpointDefinitions>(baseUrl: string, api: Narrow<Api>, options?: ZodiosOptions): ZodiosInstance<Api>
}

export const Zodios = ZodiosClass as ZodiosConstructor

export type ApiOf<Z> = Z extends ZodiosInstance<infer Api> ? Api : never

const validateRequest = async (
  api: ZodiosEndpointDefinitions,
  request: AnyZodiosRequestOptions
): AsyncResult<AnyZodiosRequestOptions, ZodiosValidationError> => {
  const endpoint = findEndpoint(api, request.method, request.url)
  if (Objects.isNil(endpoint)) {
    throw new Error(`No endpoint found for ${request.method} ${request.url}`)
  }

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
      return Results.failure(new ZodiosValidationError(`Zodios: Invalid ${type} parameter '${name}'`, request, value, parsed.error))
    }

    setParamsOf[type](name, parsed.data)
  }

  return Results.success(conf)
}

const validateSuccessResponse = async <Api extends ZodiosEndpointDefinitions, M extends HttpMethod, Path extends string>(
  api: Api,
  request: AnyZodiosRequestOptions,
  response: FetchResponse
): AsyncResult<ZodiosParsedPayloadByPath<Api, M, Path>, ZodiosValidationError> => {
  const endpoint = findEndpoint(api, request.method, request.url)
  if (Objects.isNil(endpoint)) {
    throw new Error(`No endpoint found for ${request.method} ${request.url}`)
  }

  // JOHN probably cant just assume json
  const data = await response.json()
  const parseResult = await endpoint.response.safeParseAsync(data)
  if (!parseResult.success) {
    return Results.failure(
      new ZodiosValidationError(
        `Zodios: Invalid response from endpoint '${endpoint.method} ${endpoint.path}'\nstatus: ${response.status} ${response.statusText}\ncause:\n${
          parseResult.error.message
        }\nreceived:\n${JSON.stringify(data, null, 2)}`,
        request,
        data,
        parseResult.error
      )
    )
  }

  return Results.success(parseResult.data as ZodiosParsedPayloadByPath<Api, M, Path>)
}

const validateErrorResponse = async <Api extends ZodiosEndpointDefinitions, M extends HttpMethod, Path extends string>(
  api: Api,
  request: AnyZodiosRequestOptions,
  response: FetchResponse
): AsyncResult<ZodiosParsedErrorByPath<Api, M, Path> | null, ZodiosValidationError> => {
  const endpoint = findEndpoint(api, request.method, request.url)
  if (Objects.isNil(endpoint)) {
    throw new Error(`No endpoint found for ${request.method} ${request.url}`)
  }

  const endpointErrors = findEndpointErrorsByPath(api, request.method, request.url, response)
  if (Objects.isNil(endpointErrors)) {
    return Results.success(null)
  }

  // JOHN probably cant just assume json
  const body = await response.json()
  for (const endpointError of endpointErrors) {
    const parseResult = endpointError.schema.safeParse(body)

    if (parseResult.success) {
      return Results.success(parseResult.data as ZodiosParsedErrorByPath<Api, M, Path>)
    }
  }

  // JOHN
  return Results.failure(new ZodiosValidationError(`Zodios: Invalid error response from endpoint`, request, body))
}
