import { ZodiosEndpointDefinition, ZodiosEndpointDefinitions } from '@bessemer/zodios/types'
import { Objects } from '@bessemer/cornerstone'
import { FetchResponse } from '@bessemer/cornerstone/net/fetch'

/**
 * omit properties from an object
 * @param obj - the object to omit properties from
 * @param keys - the keys to omit
 * @returns the object with the omitted properties
 */
export const omit = <T, K extends keyof T>(obj: T | undefined, keys: K[]): Omit<T, K> => {
  const ret = { ...obj } as T
  for (const key of keys) {
    delete ret[key]
  }
  return ret
}

/**
 * pick properties from an object
 * @param obj - the object to pick properties from
 * @param keys - the keys to pick
 * @returns the object with the picked properties
 */
export const pick = <T, K extends keyof T>(obj: T | undefined, keys: K[]): Pick<T, K> => {
  const ret = {} as Pick<T, K>
  if (obj) {
    for (const key of keys) {
      ret[key] = obj[key]
    }
  }
  return ret
}

const paramsRegExp = /:([a-zA-Z_][a-zA-Z0-9_]*)/g

export const replacePathParams = (url: string, params: Record<string, unknown> | undefined) => {
  let result = url
  if (Objects.isPresent(params)) {
    result = result.replace(paramsRegExp, (match, key) => (key in params ? `${params[key]}` : match))
  }
  return result
}

export const findEndpoint = (api: ZodiosEndpointDefinitions, method: string, path: string) => {
  return api.find((e) => e.method === method && e.path === path)
}

export const findEndpointByAlias = (api: ZodiosEndpointDefinitions, alias: string) => {
  return api.find((e) => e.alias === alias)
}

export const findEndpointErrors = (endpoint: ZodiosEndpointDefinition, err: FetchResponse) => {
  const matchingErrors = endpoint.errors?.filter((error) => error.status === err.status)
  if (matchingErrors && matchingErrors.length > 0) {
    return matchingErrors
  }

  return endpoint.errors?.filter((error) => error.status === 'default')
}

export const findEndpointErrorsByPath = (api: ZodiosEndpointDefinitions, method: string, path: string, err: FetchResponse) => {
  const endpoint = findEndpoint(api, method, path)
  if (Objects.isNil(endpoint)) {
    return undefined
  }

  return findEndpointErrors(endpoint, err)
}

export const findEndpointErrorsByAlias = (api: ZodiosEndpointDefinitions, alias: string, err: FetchResponse) => {
  const endpoint = findEndpointByAlias(api, alias)
  if (Objects.isNil(endpoint)) {
    return undefined
  }

  return findEndpointErrors(endpoint, err)
}
