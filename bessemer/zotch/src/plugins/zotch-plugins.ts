import { ZotchPlugin, ZotchRequest, ZotchRequestContext, ZotchResponseContext } from '@bessemer/zotch/zotch-types'
import { AsyncResult, Result } from '@bessemer/cornerstone/result'
import { Objects, Results } from '@bessemer/cornerstone'
import { HttpMethod } from '@bessemer/cornerstone/net/http-method'
import { ZotchError, ZotchRequestInvalidError } from '@bessemer/zotch/zotch-error'

export type PluginId = {
  key: string
  value: number
}

/**
 * A list of plugins that can be used by the Zotch client.
 */
export class ZotchPlugins {
  public readonly key: string
  private plugins: Array<ZotchPlugin> = []

  /**
   * Constructor
   * @param method - http method of the endpoint where the plugins are registered
   * @param path - path of the endpoint where the plugins are registered
   */
  constructor(method: HttpMethod | 'any', path: string) {
    this.key = `${method}-${path}`
  }

  /**
   * Get the index of a plugin by name
   * @param name - name of the plugin
   * @returns the index of the plugin if found, -1 otherwise
   */
  indexOf(name: string) {
    return this.plugins.findIndex((p) => p?.name === name)
  }

  /**
   * register a plugin
   * if the plugin has a name it will be replaced if it already exists
   * @param plugin - plugin to register
   * @returns unique id of the plugin
   */
  use(plugin: ZotchPlugin): PluginId {
    if (plugin.name) {
      const id = this.indexOf(plugin.name)
      if (id !== -1) {
        this.plugins[id] = plugin
        return { key: this.key, value: id }
      }
    }

    this.plugins.push(plugin)
    return { key: this.key, value: this.plugins.length - 1 }
  }

  async interceptRequest(context: ZotchRequestContext): AsyncResult<ZotchRequest, ZotchRequestInvalidError> {
    for (const plugin of this.plugins) {
      if (Objects.isPresent(plugin.processRequest)) {
        const result = await plugin.processRequest(context)

        if (Results.isFailure(result)) {
          return result
        }

        context.request = result
      }
    }

    return Results.success(context.request)
  }

  async interceptResponse<T>(response: Result<T, ZotchError>, context: ZotchResponseContext): AsyncResult<T, ZotchError> {
    let pluginResponse: Result<T, ZotchError> = response

    for (let index = this.plugins.length - 1; index >= 0; index--) {
      const plugin = this.plugins[index]

      if (Objects.isPresent(plugin)) {
        pluginResponse = (await plugin.processResponse?.(pluginResponse, context)) ?? pluginResponse
      }
    }

    return pluginResponse
  }

  count() {
    return this.plugins.length
  }
}
