import type { AxiosInstance } from 'axios'
import axios from 'axios'
import {
  Aliases,
  AnyZodiosRequestOptions,
  Method,
  ZodiosAliases,
  ZodiosBodyByPath,
  ZodiosEndpointDefinitions,
  ZodiosOptions,
  ZodiosPathsByMethod,
  ZodiosPlugin,
  ZodiosRequestOptions,
  ZodiosRequestOptionsByPath,
  ZodiosResponseByPath,
} from './zodios.types'
import { omit, replacePathParams } from './utils'
import { formDataPlugin, formURLPlugin, headerPlugin, PluginId, ZodiosPlugins, zodValidationPlugin } from './plugins'
import { Narrow, PickRequired, ReadonlyDeep, RequiredKeys, UndefinedIfNever } from './utils.types'
import { checkApi } from './api'

/**
 * zodios api client based on axios
 */
export class ZodiosClass<Api extends ZodiosEndpointDefinitions> {
  private axiosInstance: AxiosInstance
  public readonly options: PickRequired<ZodiosOptions, 'validate' | 'transform' | 'sendDefaults'>
  public readonly api: Api
  private endpointPlugins: Map<string, ZodiosPlugins> = new Map()

  /**
   * constructor
   * @param baseURL - the base url to use - if omited will use the browser domain
   * @param api - the description of all the api endpoints
   * @param options - the options to setup the client API
   * @example
   *   const apiClient = new Zodios("https://jsonplaceholder.typicode.com", [
   *     {
   *       method: "get",
   *       path: "/users",
   *       description: "Get all users",
   *       parameters: [
   *         {
   *           name: "q",
   *           type: "Query",
   *           schema: z.string(),
   *         },
   *         {
   *           name: "page",
   *           type: "Query",
   *           schema: z.string().optional(),
   *         },
   *       ],
   *       response: z.array(z.object({ id: z.number(), name: z.string() })),
   *     }
   *   ]);
   */
  constructor(api: Narrow<Api>, options?: ZodiosOptions)
  constructor(baseUrl: string, api: Narrow<Api>, options?: ZodiosOptions)
  constructor(arg1?: Api | string, arg2?: Api | ZodiosOptions, arg3?: ZodiosOptions) {
    let options: ZodiosOptions
    if (!arg1) {
      if (Array.isArray(arg2)) {
        throw new Error('Zodios: missing base url')
      }
      throw new Error('Zodios: missing api description')
    }
    let baseURL: string | undefined
    if (typeof arg1 === 'string' && Array.isArray(arg2)) {
      baseURL = arg1
      this.api = arg2
      options = arg3 || {}
    } else if (Array.isArray(arg1) && !Array.isArray(arg2)) {
      this.api = arg1
      options = arg2 || {}
    } else {
      throw new Error('Zodios: api must be an array')
    }

    checkApi(this.api)

    this.options = {
      validate: true,
      transform: true,
      sendDefaults: false,
      ...options,
    }

    if (this.options.axiosInstance) {
      this.axiosInstance = this.options.axiosInstance
    } else {
      this.axiosInstance = axios.create({
        ...this.options.axiosConfig,
      })
    }
    if (baseURL) this.axiosInstance.defaults.baseURL = baseURL

    this.injectAliasEndpoints()
    this.initPlugins()
    if ([true, 'all', 'request', 'response'].includes(this.options.validate)) {
      this.use(zodValidationPlugin(this.options))
    }
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

  private findEnpointPlugins(method: Method, path: string) {
    return this.endpointPlugins.get(`${method}-${path}`)
  }

  /**
   * get the base url of the api
   */
  get baseURL() {
    return this.axiosInstance.defaults.baseURL
  }

  /**
   * get the underlying axios instance
   */
  get axios() {
    return this.axiosInstance
  }

  /**
   * register a plugin to intercept the requests or responses
   * @param plugin - the plugin to use
   * @returns an id to allow you to unregister the plugin
   */
  use(plugin: ZodiosPlugin): PluginId
  use<Alias extends Aliases<Api>>(alias: Alias, plugin: ZodiosPlugin): PluginId
  use<M extends Method, Path extends ZodiosPathsByMethod<Api, M>>(method: M, path: Path, plugin: ZodiosPlugin): PluginId
  use(...args: unknown[]) {
    if (typeof args[0] === 'object') {
      const plugins = this.getAnyEndpointPlugins()!
      return plugins.use(args[0] as ZodiosPlugin)
    } else if (typeof args[0] === 'string' && typeof args[1] === 'object') {
      const plugins = this.findAliasEndpointPlugins(args[0])
      if (!plugins) throw new Error(`Zodios: no alias '${args[0]}' found to register plugin`)
      return plugins.use(args[1] as ZodiosPlugin)
    } else if (typeof args[0] === 'string' && typeof args[1] === 'string' && typeof args[2] === 'object') {
      const plugins = this.findEnpointPlugins(args[0] as Method, args[1])
      if (!plugins) throw new Error(`Zodios: no endpoint '${args[0]} ${args[1]}' found to register plugin`)
      return plugins.use(args[2] as ZodiosPlugin)
    }
    throw new Error('Zodios: invalid plugin registration')
  }

  /**
   * unregister a plugin
   * if the plugin name is provided instead of the registration plugin id,
   * it will unregister the plugin with that name only for non endpoint plugins
   * @param plugin - id of the plugin to remove
   */
  eject(plugin: PluginId | string): void {
    if (typeof plugin === 'string') {
      const plugins = this.getAnyEndpointPlugins()!
      plugins.eject(plugin)
      return
    }
    this.endpointPlugins.get(plugin.key)?.eject(plugin)
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

  /**
   * make a request to the api
   * @param config - the config to setup zodios options and parameters
   * @returns response validated with zod schema provided in the api description
   */
  async request<M extends Method, Path extends string>(
    config: Path extends ZodiosPathsByMethod<Api, M>
      ? ReadonlyDeep<ZodiosRequestOptions<Api, M, Path>>
      : ReadonlyDeep<ZodiosRequestOptions<Api, M, ZodiosPathsByMethod<Api, M>>>
  ): Promise<ZodiosResponseByPath<Api, M, Path extends ZodiosPathsByMethod<Api, M> ? Path : never>> {
    let conf = config as unknown as ReadonlyDeep<AnyZodiosRequestOptions>
    const anyPlugin = this.getAnyEndpointPlugins()!
    const endpointPlugin = this.findEnpointPlugins(conf.method, conf.url)
    conf = await anyPlugin.interceptRequest(this.api, conf)
    if (endpointPlugin) {
      conf = await endpointPlugin.interceptRequest(this.api, conf)
    }
    let response = this.axiosInstance.request({
      ...omit(conf as AnyZodiosRequestOptions, ['params', 'queries']),
      url: replacePathParams(conf),
      params: conf.queries,
    })
    if (endpointPlugin) {
      response = endpointPlugin.interceptResponse(this.api, conf, response)
    }
    response = anyPlugin.interceptResponse(this.api, conf, response)
    return (await response).data
  }

  /**
   * make a get request to the api
   * @param path - the path to api endpoint
   * @param config - the config to setup axios options and parameters
   * @returns response validated with zod schema provided in the api description
   */
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

  /**
   * make a post request to the api
   * @param path - the path to api endpoint
   * @param data - the data to send
   * @param config - the config to setup axios options and parameters
   * @returns response validated with zod schema provided in the api description
   */
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

  /**
   * make a put request to the api
   * @param path - the path to api endpoint
   * @param data - the data to send
   * @param config - the config to setup axios options and parameters
   * @returns response validated with zod schema provided in the api description
   */
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

  /**
   * make a patch request to the api
   * @param path - the path to api endpoint
   * @param data - the data to send
   * @param config - the config to setup axios options and parameters
   * @returns response validated with zod schema provided in the api description
   */
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

  /**
   * make a delete request to the api
   * @param path - the path to api endpoint
   * @param config - the config to setup axios options and parameters
   * @returns response validated with zod schema provided in the api description
   */
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

/**
 * Get the Api description type from zodios
 * @param Z - zodios type
 */
export type ApiOf<Z> = Z extends ZodiosInstance<infer Api> ? Api : never
