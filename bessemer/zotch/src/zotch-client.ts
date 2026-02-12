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
  ZotchRequestDto,
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
import { Arrays, Assertions, Entries, Errors, Json, Objects, Results, Strings, Types, Urls, ZodUtil } from '@bessemer/cornerstone'
import { AsyncResult } from '@bessemer/cornerstone/result'
import { HttpMethod } from '@bessemer/cornerstone/net/http-method'
import { FetchFunction, FetchPayload } from '@bessemer/cornerstone/net/fetch'
import { ZotchErrorType, ZotchRequestInvalidError, ZotchResponseInvalidError } from '@bessemer/zotch/zotch-error'
import Zod from 'zod'
import { formUrlPlugin } from '@bessemer/zotch/plugins/form-url-plugin'
import { validateEndpointDefinitions } from '@bessemer/zotch/zotch-api'
import { createDraft, finishDraft } from 'immer'

const ZotchClientPropsSchema = Zod.object({
  baseUrl: Zod.string().default(''),
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
    Types.cast<ZotchRequest>(initialRequest)

    let request: ZotchRequestDto = {
      ...initialRequest,
      params: initialRequest.params ?? {},
      method: initialRequest.method ?? {},
      headers: initialRequest.headers ?? {},
    }

    const anyPlugin = this.getAnyEndpointPlugins()!
    const endpointPlugin = this.findEnpointPlugins(request.method, request.url)

    const endpoint = findEndpoint(this.api, request.method, request.url)
    Assertions.assertPresent(endpoint, () => `No endpoint found for ${request.method} ${request.url}`)

    const validatedRequest = await validateRequest(endpoint, request)
    if (Results.isFailure(validatedRequest)) {
      return validatedRequest
    }
    request = validatedRequest

    const anyPluginResult = await anyPlugin.interceptRequest({ endpoint, request })
    if (Results.isFailure(anyPluginResult)) {
      return anyPluginResult
    }
    request = anyPluginResult

    if (Objects.isPresent(endpointPlugin)) {
      const endpointPluginResult = await endpointPlugin.interceptRequest({ endpoint, request })
      if (Results.isFailure(endpointPluginResult)) {
        return endpointPluginResult
      }

      request = endpointPluginResult
    }

    let response: ZotchResultByPath<Api, M, Path>

    const { baseUrl, url, params, queries, body, method, ...fetchOptions } = request

    // JOHN how to handle arrays of params? and does just calling toString on the value here present a robust solution...
    const queryParams = Object.fromEntries(Object.entries(queries ?? {}).map(([key, value]) => Entries.of(key, `${value}`)))

    const baseUrlResult = Urls.parseString(request.baseUrl ?? this.props.baseUrl)
    if (Results.isFailure(baseUrlResult)) {
      return Results.failure({
        type: ZotchErrorType.RequestInvalid,
        message: baseUrlResult.value.message,
        endpoint,
        request,
        value: request.baseUrl ?? this.props.baseUrl,
      })
    }

    const targetUrlString = replacePathParams(url, params)
    const targetUrlResult = Urls.parseString(targetUrlString)
    if (Results.isFailure(targetUrlResult)) {
      return Results.failure({
        type: ZotchErrorType.RequestInvalid,
        message: targetUrlResult.value.message,
        endpoint,
        request,
        value: targetUrlString,
      })
    }

    const urlLiteral = Urls.toLiteral(
      Urls.navigate(baseUrlResult, Urls.update(targetUrlResult, { location: { parameters: queryParams }, relative: true }))
    )

    const fetchPayload: FetchPayload = {
      ...fetchOptions,
      url: urlLiteral,
      method: method.toUpperCase(),
      body: JSON.stringify(request.body),
      headers: { 'Content-Type': 'application/json', ...request.headers },
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
        if (Results.isSuccess(validatedError)) {
          if (Objects.isNil(validatedError)) {
            response = Results.failure({
              type: ZotchErrorType.Unstructured,
              ...responseContext,
            })
          } else {
            response = Results.failure({
              type: ZotchErrorType.Structured,
              ...responseContext,
              ...validatedError,
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
    body: ReadonlyDeep<UndefinedIfNever<ZotchBodyByPath<Api, 'post', Path>>>,
    ...[config]: RequiredKeys<TConfig> extends never ? [config?: ReadonlyDeep<TConfig>] : [config: ReadonlyDeep<TConfig>]
  ): Promise<ZotchResponseByPath<Api, 'post', Path>> {
    return this.request({
      ...config,
      method: 'post',
      url: path,
      body,
    } as any)
  }

  async put<Path extends ZotchPathsByMethod<Api, 'put'>, TConfig extends ZotchRequestOptionsByPath<Api, 'put', Path>>(
    path: Path,
    body: ReadonlyDeep<UndefinedIfNever<ZotchBodyByPath<Api, 'put', Path>>>,
    ...[config]: RequiredKeys<TConfig> extends never ? [config?: ReadonlyDeep<TConfig>] : [config: ReadonlyDeep<TConfig>]
  ): Promise<ZotchResponseByPath<Api, 'put', Path>> {
    return this.request({
      ...config,
      method: 'put',
      url: path,
      body,
    } as any)
  }

  async patch<Path extends ZotchPathsByMethod<Api, 'patch'>, TConfig extends ZotchRequestOptionsByPath<Api, 'patch', Path>>(
    path: Path,
    body: ReadonlyDeep<UndefinedIfNever<ZotchBodyByPath<Api, 'patch', Path>>>,
    ...[config]: RequiredKeys<TConfig> extends never ? [config?: ReadonlyDeep<TConfig>] : [config: ReadonlyDeep<TConfig>]
  ): Promise<ZotchResponseByPath<Api, 'patch', Path>> {
    return this.request({
      ...config,
      method: 'patch',
      url: path,
      body,
    } as any)
  }

  async delete<Path extends ZotchPathsByMethod<Api, 'delete'>, TConfig extends ZotchRequestOptionsByPath<Api, 'delete', Path>>(
    path: Path,
    body: ReadonlyDeep<UndefinedIfNever<ZotchBodyByPath<Api, 'delete', Path>>>,
    ...[config]: RequiredKeys<TConfig> extends never ? [config?: ReadonlyDeep<TConfig>] : [config: ReadonlyDeep<TConfig>]
  ): Promise<ZotchResponseByPath<Api, 'delete', Path>> {
    return this.request({
      ...config,
      method: 'delete',
      url: path,
      body,
    } as any)
  }
}

export type ZotchClient<Api extends ZotchEndpointDefinitions> = ZotchClientClass<Api> & ZotchAliases<Api>
export type ApiOf<Z> = Z extends ZotchClient<infer Api> ? Api : never

const validateRequest = async (
  endpoint: ZotchEndpointDefinition,
  initialRequest: ZotchRequestDto
): AsyncResult<ZotchRequestDto, ZotchRequestInvalidError> => {
  const { body, params, headers, queries } = endpoint

  const request = createDraft(initialRequest)
  if (Objects.isNil(request.headers)) {
    request.headers = {}
  }
  if (Objects.isNil(request.queries)) {
    request.queries = {}
  }
  if (Objects.isNil(request.params)) {
    request.params = {}
  }

  if (Objects.isPresent(body)) {
    const parsed = await ZodUtil.parseAsync(body, request.body)
    if (Results.isFailure(parsed)) {
      return Results.failure({
        type: ZotchErrorType.RequestInvalid,
        message: `Zotch: Invalid Body'`,
        endpoint,
        request,
        value: request.body,
        cause: parsed.value,
      })
    }

    request.body = parsed
  }

  for (const [name, schema] of Object.entries(params ?? {})) {
    const value = request.params?.[name]
    const parsed = await ZodUtil.parseAsync(schema, value)
    if (Results.isFailure(parsed)) {
      return Results.failure({
        type: ZotchErrorType.RequestInvalid,
        message: `Zotch: Invalid path parameter '${name}'`,
        endpoint,
        request,
        value,
        cause: parsed.value,
      })
    }

    request.params[name] = parsed
  }

  for (const [name, schema] of Object.entries(queries ?? {})) {
    const value = request.queries?.[name]
    const parsed = await ZodUtil.parseAsync(schema, value)
    if (Results.isFailure(parsed)) {
      return Results.failure({
        type: ZotchErrorType.RequestInvalid,
        message: `Zotch: Invalid query '${name}'`,
        endpoint,
        request,
        value,
        cause: parsed.value,
      })
    }

    request.queries[name] = parsed
  }

  for (const [name, schema] of Object.entries(headers ?? {})) {
    const value = request.headers?.[name]
    const parsed = await ZodUtil.parseAsync(schema, value)
    if (Results.isFailure(parsed)) {
      return Results.failure({
        type: ZotchErrorType.RequestInvalid,
        message: `Zotch: Invalid header '${name}'`,
        endpoint,
        request,
        value,
        cause: parsed.value,
      })
    }

    request.headers[name] = parsed as any as string
  }

  return Results.success(finishDraft(request))
}

const validateSuccessResponse = async <Api extends ZotchEndpointDefinitions, M extends HttpMethod, Path extends string>(
  context: ZotchResponseContext
): AsyncResult<ZotchPayloadTypeByPath<Api, M, Path>, ZotchResponseInvalidError> => {
  const { endpoint, response } = context
  const body = await response.text()
  const jsonResult = Json.parse(body)
  if (Results.isFailure(jsonResult)) {
    return Results.failure({
      type: ZotchErrorType.ResponseInvalid,
      ...context,
      message: `Zotch: Unable to parse JSON from endpoint '${endpoint.method} ${endpoint.path}'\nstatus: ${response.status} ${response.statusText}\ncause:\n${jsonResult.value.message}\nreceived:\n${body}`,
      value: body,
      cause: jsonResult.value,
    })
  }

  const parseResult = await ZodUtil.parseAsync(endpoint.response, jsonResult)
  if (Results.isFailure(parseResult)) {
    return Results.failure({
      type: ZotchErrorType.ResponseInvalid,
      ...context,
      message: `Zotch: Invalid response from endpoint '${endpoint.method} ${endpoint.path}'\nstatus: ${response.status} ${
        response.statusText
      }\ncause:\n${parseResult.value.message}\nreceived:\n${JSON.stringify(jsonResult, null, 2)}`,
      value: jsonResult,
      cause: parseResult.value,
    })
  }

  return Results.success(parseResult as ZotchPayloadTypeByPath<Api, M, Path>)
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
    if (Results.isFailure(jsonResult)) {
      return Results.failure({
        type: ZotchErrorType.ResponseInvalid,
        ...context,
        message: `Zotch: Unable to parse JSON from endpoint '${endpoint.method} ${endpoint.path}'\nstatus: ${response.status} ${response.statusText}\ncause:\n${jsonResult.value.message}\nreceived:\n${body}`,
        value: body,
        cause: jsonResult.value,
      })
    }

    jsonValue = jsonResult
  }

  const endpointErrorUnion = Zod.union(endpointErrors.map((it) => it.schema))
  const parseResult = await ZodUtil.parseAsync(endpointErrorUnion, jsonValue)

  if (Results.isFailure(parseResult)) {
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

  return Results.success({ status: response.status, value: parseResult } as ZotchErrorTypeByPath<Api, M, Path>)
}
