import { ZotchRequestContext, ZotchRequestDto, ZotchResponseContext } from '@bessemer/zotch/zotch-types'
import { AsyncResult, Result } from '@bessemer/cornerstone/result'
import { Objects, Results } from '@bessemer/cornerstone'
import { HttpMethod } from '@bessemer/cornerstone/net/http-method'
import { ZotchError, ZotchRequestInvalidError } from '@bessemer/zotch/zotch-error'

export type ZotchPlugin = {
  name?: string
  processRequest?: (context: ZotchRequestContext) => AsyncResult<ZotchRequestDto, ZotchRequestInvalidError>
  processResponse?: <T>(response: Result<T, ZotchError>, context: ZotchResponseContext) => AsyncResult<T, ZotchError>
}

export type PluginId = {
  key: string
  value: number
}

export class ZotchPlugins {
  public readonly key: string
  private plugins: Array<ZotchPlugin> = []

  constructor(method: HttpMethod | 'any', path: string) {
    this.key = `${method}-${path}`
  }

  private indexOf(name: string) {
    return this.plugins.findIndex((p) => p?.name === name)
  }

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

  async interceptRequest(context: ZotchRequestContext): AsyncResult<ZotchRequestDto, ZotchRequestInvalidError> {
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

  length = () => this.plugins.length
}
