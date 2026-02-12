import type { OpenAPIV3 } from 'openapi-types'
import Zod from 'zod'
import { ZotchEndpointDefinitions } from '@bessemer/zotch/zotch-types'
import { Objects, ZodUtil } from '@bessemer/cornerstone'

const pathRegExp = /:([a-zA-Z_][a-zA-Z0-9_]*)/g

const pathWithoutParams = (path: string) => {
  return path.indexOf('?') > -1 ? path.split('?')[0]! : path.indexOf('#') > -1 ? path.split('#')[0]! : path
}

const tagsFromPath = (path: string): string[] | undefined => {
  const resources = pathWithoutParams(path)
    .replace(pathRegExp, '')
    .split('/')
    .filter((part) => part !== '')

  return resources ? [resources[0]!] : undefined
}

export const bearerAuthScheme = (description?: string): OpenAPIV3.SecuritySchemeObject => {
  return {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description,
  }
}

export const basicAuthScheme = (description?: string): OpenAPIV3.SecuritySchemeObject => {
  return {
    type: 'http',
    scheme: 'basic',
    description,
  }
}

export const apiKeyAuthScheme = (
  options: Omit<OpenAPIV3.ApiKeySecurityScheme, 'type' | 'description'>,
  description?: string
): OpenAPIV3.SecuritySchemeObject => {
  return {
    type: 'apiKey',
    description,
    ...options,
  }
}

export const oauth2Scheme = (flows: OpenAPIV3.OAuth2SecurityScheme['flows'], description?: string): OpenAPIV3.SecuritySchemeObject => {
  return {
    type: 'oauth2',
    description,
    flows,
  }
}

const makeJsonSchema = (schema: Zod.ZodType): OpenAPIV3.SchemaObject => {
  return Zod.toJSONSchema(schema, { unrepresentable: 'any' }) as OpenAPIV3.SchemaObject
}

/**
 * Create an openapi V3 document from a list of api definitions
 * Use this function if you want to define multiple apis protected by different security schemes
 * @param options  - the parameters to create the document
 * @returns - the openapi V3 document
 */
const makeOpenApi = (options: {
  apis: Array<
    | {
        definitions: ZotchEndpointDefinitions
      }
    | {
        scheme: string
        securityRequirement?: string[]
        definitions: ZotchEndpointDefinitions
      }
  >
  info?: OpenAPIV3.InfoObject
  servers?: OpenAPIV3.ServerObject[]
  securitySchemes?: Record<string, OpenAPIV3.SecuritySchemeObject>
  tagsFromPathFn?: (path: string) => string[]
}) => {
  // JOHN
  // const { tagsFromPathFn = tagsFromPath } = options
  const openApi: OpenAPIV3.Document = {
    openapi: '3.0.0',
    info: options.info ?? {
      title: "Zotch : add an info object to 'toOpenApi' options",
      version: '1.0.0',
    },
    servers: options.servers,
    paths: {},
  }

  if (options.securitySchemes) {
    openApi.components = {
      securitySchemes: options.securitySchemes,
    }
  }
  for (let api of options.apis) {
    for (let endpoint of api.definitions) {
      const responses: OpenAPIV3.ResponsesObject = {
        [`${endpoint.status ?? 200}`]: {
          description: endpoint.responseDescription ?? endpoint.response.description ?? 'Success',
          content: {
            'application/json': {
              schema: makeJsonSchema(endpoint.response),
            },
          },
        },
      }
      for (let error of endpoint.errors ?? []) {
        responses[`${error.status}`] = {
          description: error.description ?? error.schema.description ?? 'Error',
          content: {
            'application/json': {
              schema: makeJsonSchema(error.schema),
            },
          },
        }
      }
      const parameters: OpenAPIV3.ParameterObject[] = []
      // extract path parameters from endpoint path
      const pathParams = endpoint.path.match(pathRegExp)
      if (pathParams) {
        for (let pathParam of pathParams) {
          const paramName = pathParam.slice(1)
          const schema = endpoint.params?.[paramName]
          if (Objects.isPresent(schema)) {
            parameters.push({
              name: paramName,
              description: schema.description,
              in: 'path',
              schema: makeJsonSchema(schema),
              required: true,
            })
          } else {
            parameters.push({
              name: paramName,
              in: 'path',
              schema: {
                type: 'string',
              },
              required: true,
            })
          }
        }
      }

      for (const [name, schema] of Object.entries(endpoint.queries ?? {})) {
        parameters.push({
          // JOHN
          // name: param.type === 'Query' && isZodType(param.schema, Zod.ZodArray) ? `${param.name}[]` : param.name,
          name: name,
          in: 'query',
          schema: makeJsonSchema(schema),
          description: schema.description,
          required: ZodUtil.isRequired(schema),
        })
      }

      for (const [name, schema] of Object.entries(endpoint.headers ?? {})) {
        parameters.push({
          name,
          in: 'header',
          schema: makeJsonSchema(schema),
          description: schema.description,
          required: ZodUtil.isRequired(schema),
        })
      }

      const path = endpoint.path.replace(pathRegExp, '{$1}')
      const body = endpoint.body

      const operation: OpenAPIV3.OperationObject = {
        operationId: endpoint.alias,
        summary: endpoint.alias,
        description: endpoint.description,
        tags: tagsFromPath(endpoint.path),
        security: 'scheme' in api && api.scheme ? [{ [api.scheme]: api.securityRequirement ?? ([] as string[]) }] : undefined,
        requestBody: body
          ? {
              description: body.description,
              content: {
                'application/json': {
                  schema: makeJsonSchema(body),
                },
              },
            }
          : undefined,
        parameters,
        responses,
      }
      openApi.paths[path] = {
        ...openApi.paths[path],
        [endpoint.method]: operation,
      }
    }
  }
  return openApi
}

export class OpenApiBuilder {
  apis: Array<
    | {
        definitions: ZotchEndpointDefinitions
      }
    | {
        scheme: string
        securityRequirement?: string[]
        definitions: ZotchEndpointDefinitions
      }
  > = []
  options: {
    info: OpenAPIV3.InfoObject
    servers?: OpenAPIV3.ServerObject[]
    securitySchemes?: Record<string, OpenAPIV3.SecuritySchemeObject>
    tagsFromPathFn?: (path: string) => string[]
  }
  constructor(info: OpenAPIV3.InfoObject) {
    this.options = { info }
  }

  /**
   * add a security scheme to proctect the apis
   * @param name - the name of the security scheme
   * @param securityScheme - the security scheme object
   */
  addSecurityScheme = (name: string, securityScheme: OpenAPIV3.SecuritySchemeObject) => {
    this.options.securitySchemes ??= {}
    this.options.securitySchemes[name] = securityScheme
    return this
  }

  /**
   * add an api with public endpoints
   * @param definitions - the endpoint definitions
   * @returns
   */
  addPublicApi = (definitions: ZotchEndpointDefinitions) => {
    this.apis.push({ definitions })
    return this
  }

  /**
   * add an api protected by a security scheme
   * @param scheme - the name of the security scheme to use
   * @param definitions - the endpoints API
   * @param securityRequirement - optional security requirement to use for this API (oauth2 scopes for example)
   */
  addProtectedApi = (scheme: string, definitions: ZotchEndpointDefinitions, securityRequirement?: string[]) => {
    this.apis.push({ scheme, definitions, securityRequirement })
    return this
  }

  /**
   * add a server to the openapi document
   * @param server - the server to add
   */
  addServer = (server: OpenAPIV3.ServerObject) => {
    this.options.servers ??= []
    this.options.servers.push(server)
    return this
  }

  /**
   * ovveride the default tagsFromPathFn
   * @param tagsFromPathFn - a function that takes a path and returns the tags to use for this path
   */
  setCustomTagsFn = (tagsFromPathFn: (path: string) => string[]) => {
    this.options.tagsFromPathFn = tagsFromPathFn
    return this
  }

  build = () => {
    return makeOpenApi({
      apis: this.apis,
      ...this.options,
    })
  }
}

/**
 * Builder to easily create an openapi V3 document from zodios api definitions
 * @param info - the info object to add to the document
 * @returns - the openapi V3 builder
 */
export const openApiBuilder = (info: OpenAPIV3.InfoObject) => {
  return new OpenApiBuilder(info)
}
