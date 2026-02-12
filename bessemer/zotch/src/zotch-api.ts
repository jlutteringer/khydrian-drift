import { ZodiosEndpointError, ZodiosEndpointParameter, ZotchEndpointDefinitionEntry, ZotchEndpointDefinitions } from '@bessemer/zotch/zotch-types'
import Zod from 'zod'
import { Narrow, TupleFlat, UnionToTuple } from '@bessemer/zotch/zotch-type-utils'
import { Assertions, Strings } from '@bessemer/cornerstone'
import { ZotchError, ZotchErrorType, ZotchStructuredError, ZotchStructuredErrorProps } from '@bessemer/zotch/zotch-error'
import { ZotchClient, ZotchClientClass, ZotchClientProps } from '@bessemer/zotch/zotch-client'

export const client = <Api extends ZotchEndpointDefinitions>(api: Narrow<Api>, props?: ZotchClientProps): ZotchClient<Api> => {
  return new ZotchClientClass(api as ZotchEndpointDefinitions, props) as any as ZotchClient<Api>
}

/**
 * check api for non unique paths
 * @param api - api to check
 * @return - nothing
 * @throws - error if api has non unique paths
 */
export const validateEndpointDefinitions = <T extends ZotchEndpointDefinitions>(api: T) => {
  // check if no duplicate path
  const paths = new Set<string>()
  for (const endpoint of Object.values(api)) {
    const fullpath = `${endpoint.method} ${endpoint.path}`

    if (paths.has(fullpath)) {
      throw new Error(`Zotch: Duplicate path '${fullpath}'`)
    }

    paths.add(fullpath)
  }
}

/**
 * Simple helper to split your api definitions into multiple files
 * Mandatory to be used when declaring your endpoint definitions outside zodios constructor
 * to enable type inferrence and autocompletion
 * @param api - api definitions
 * @returns the api definitions
 */
export const makeApi = <T extends string, Api extends ZotchEndpointDefinitions<T>>(api: Narrow<Api>): Api => {
  validateEndpointDefinitions(api as ZotchEndpointDefinitions)
  return api as Api
}

/**
 * Simple helper to split your parameter definitions into multiple files
 * Mandatory to be used when declaring parameters appart from your endpoint definitions
 * to enable type inferrence and autocompletion
 * @param params - api parameter definitions
 * @returns the api parameter definitions
 */
export const makeParameters = <ParameterDescriptions extends ZodiosEndpointParameter[]>(
  params: Narrow<ParameterDescriptions>
): ParameterDescriptions => {
  return params as ParameterDescriptions
}

// export const parametersBuilder = () => {
//   return new ParametersBuilder<[]>([])
// }

type ObjectToQueryParameters<
  Type extends 'Query' | 'Path' | 'Header',
  T extends Record<string, Zod.ZodType<any, any>>,
  Keys = UnionToTuple<keyof T>
> = {
  [Index in keyof Keys]: {
    name: Keys[Index]
    type: Type
    description?: string
    schema: T[Extract<Keys[Index], keyof T>]
  }
}

// class ParametersBuilder<T extends ZodiosEndpointParameter[]> {
//   constructor(private params: T) {}
//
//   addParameter<Name extends string, Type extends 'Path' | 'Query', Schema extends Zod.ZodType<any, any>>(name: Name, type: Type, schema: Schema) {
//     return new ParametersBuilder<[...T, { name: Name; type: Type; description?: string; schema: Schema }]>([
//       ...this.params,
//       { name, type, description: schema.description, schema },
//     ])
//   }
//
//   addParameters<Type extends 'Query' | 'Path' | 'Header', Schemas extends Record<string, Zod.ZodType<any, any>>>(type: Type, schemas: Schemas) {
//     const parameters = Object.keys(schemas).map((key) => ({
//       name: key,
//       type,
//       description: schemas[key]!.description,
//       schema: schemas[key],
//     }))
//
//     return new ParametersBuilder<[...T, ...Extract<ObjectToQueryParameters<Type, Schemas>, ZodiosEndpointParameter[]>]>([
//       ...this.params,
//       ...parameters,
//     ] as any)
//   }
//
//   addBody<Schema extends Zod.ZodType<any, any>>(schema: Schema) {
//     return this.addParameter('body', 'Body', schema)
//   }
//
//   addQuery<Name extends string, Schema extends Zod.ZodType<any, any>>(name: Name, schema: Schema) {
//     return this.addParameter(name, 'Query', schema)
//   }
//
//   addPath<Name extends string, Schema extends Zod.ZodType<any, any>>(name: Name, schema: Schema) {
//     return this.addParameter(name, 'Path', schema)
//   }
//
//   addHeader<Name extends string, Schema extends Zod.ZodType<any, any>>(name: Name, schema: Schema) {
//     return this.addParameter(name, 'Header', schema)
//   }
//
//   addQueries<Schemas extends Record<string, Zod.ZodType<any, any>>>(schemas: Schemas) {
//     return this.addParameters('Query', schemas)
//   }
//
//   addPaths<Schemas extends Record<string, Zod.ZodType<any, any>>>(schemas: Schemas) {
//     return this.addParameters('Path', schemas)
//   }
//
//   addHeaders<Schemas extends Record<string, Zod.ZodType<any, any>>>(schemas: Schemas) {
//     return this.addParameters('Header', schemas)
//   }
//
//   build() {
//     return this.params
//   }
// }

export const makeErrors = <ErrorDescription extends ZodiosEndpointError[]>(errors: Narrow<ErrorDescription>): ErrorDescription => {
  return errors as ErrorDescription
}

export const makeEndpoint = <T extends ZotchEndpointDefinitionEntry<any>>(endpoint: Narrow<T>): T => {
  return endpoint as T
}

// export class Builder<T extends ZotchEndpointDefinitions> {
//   constructor(private api: T) {}
//
//   addEndpoint<E extends ZotchEndpointDefinitionEntry>(endpoint: Narrow<E>): Builder<[...T, E]> {
//     if (this.api.length === 0) {
//       this.api = [endpoint] as T
//       return this as any
//     }
//     this.api = [...this.api, endpoint] as any
//     return this as any
//   }
//
//   build(): T {
//     validateEndpointDefinitions(this.api!)
//     return this.api!
//   }
// }
//
// /**
//  * Advanced helper to build your api definitions
//  * compared to `makeApi()` you'll have better autocompletion experience and better error messages,
//  * @param endpoint
//  * @returns - a builder to build your api definitions
//  */
// export function apiBuilder(): Builder<[]>
// export function apiBuilder<T extends ZotchEndpointDefinitionEntry<any>>(endpoint: Narrow<T>): Builder<[T]>
// export function apiBuilder(endpoint?: any) {
//   if (!endpoint) {
//     return new Builder([])
//   }
//
//   return new Builder([endpoint])
// }

/**
 * Helper to generate a basic CRUD api for a given resource
 * @param resource - the resource to generate the api for
 * @param schema - the schema of the resource
 * @returns - the api definitions
 */
export const makeCrudApi = <T extends string, S extends Zod.ZodObject<Zod.ZodRawShape>>(resource: T, schema: S) => {
  type Schema = Zod.input<S>
  const capitalizedResource = Strings.capitalize(resource)

  return makeApi({
    [`get${capitalizedResource}`]: {
      method: 'get',
      path: `/${resource}s/:id`,
      description: `Get a ${resource}`,
      response: schema,
    },
    [`create${capitalizedResource}`]: {
      method: 'post',
      path: `/${resource}s`,
      description: `Create a ${resource}`,
      body: schema.partial(),
      response: schema,
    },
    [`update${capitalizedResource}`]: {
      method: 'put',
      path: `/${resource}s/:id`,
      description: `Update a ${resource}`,
      body: schema,
      response: schema,
    },
    [`patch${capitalizedResource}`]: {
      method: 'patch',
      path: `/${resource}s/:id`,
      description: `Patch a ${resource}`,
      body: schema.partial(),
      response: schema,
    },
    [`delete${capitalizedResource}`]: {
      method: 'delete',
      path: `/${resource}s/:id`,
      description: `Delete a ${resource}`,
      response: schema,
    },
  })
}

type CleanPath<Path extends string> = Path extends `${infer PClean}/` ? PClean : Path

type MapApiPath<Path extends string, Api, Acc extends unknown[] = []> = Api extends readonly [infer Head, ...infer Tail]
  ? MapApiPath<
      Path,
      Tail,
      [
        ...Acc,
        {
          [K in keyof Head]: K extends 'path' ? (Head[K] extends string ? CleanPath<`${Path}${Head[K]}`> : Head[K]) : Head[K]
        }
      ]
    >
  : Acc

type MergeApis<
  Apis extends Record<string, ZotchEndpointDefinitionEntry[]>,
  MergedPathApis = UnionToTuple<
    {
      [K in keyof Apis]: K extends string ? MapApiPath<K, Apis[K]> : never
    }[keyof Apis]
  >
> = TupleFlat<MergedPathApis>

const cleanPath = (path: string) => {
  return path.endsWith('/') ? path.slice(0, -1) : path
}

/**
 * prefix all paths of an api with a given prefix
 * @param prefix - the prefix to add
 * @param api - the api to prefix
 * @returns the prefixed api
 */
export const prefixApi = <Prefix extends string, Api extends ZotchEndpointDefinitionEntry[]>(prefix: Prefix, api: Api): MapApiPath<Prefix, Api> => {
  return api.map((endpoint) => ({
    ...endpoint,
    path: cleanPath(`${prefix}${endpoint.path}`),
  })) as MapApiPath<Prefix, Api>
}

/**
 * Merge multiple apis into one in a route friendly way
 * @param apis - the apis to merge
 * @returns the merged api
 *
 * @example
 * ```ts
 * const api = mergeApis({
 *   "/users": usersApi,
 *   "/posts": postsApi,
 * });
 * ```
 */
export const mergeApis = <Apis extends Record<string, ZotchEndpointDefinitionEntry[]>>(apis: Apis): MergeApis<Apis> => {
  return Object.keys(apis).flatMap((key) => prefixApi(key, apis[key]!)) as any
}

export const isStructuredError = (error: ZotchError): boolean => {
  return error.type === ZotchErrorType.Structured
}

export function assertStructuredError<T extends ZotchStructuredErrorProps>(error: ZotchError<T>): asserts error is ZotchStructuredError<T> {
  Assertions.assert(isStructuredError(error))
}
