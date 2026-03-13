import { ZotchEndpointDefinitions } from '@bessemer/zotch/zotch-types'
import { Narrow } from '@bessemer/zotch/zotch-type-utils'
import { Assertions } from '@bessemer/cornerstone'
import { validateEndpointDefinitions, ZotchClient, ZotchClientClass, ZotchClientProps } from '@bessemer/zotch/zotch-client'
import { ZotchError, ZotchErrorType, ZotchStructuredError, ZotchStructuredErrorProps } from '@bessemer/zotch/zotch-error'

export const client = <Api extends ZotchEndpointDefinitions>(api: Narrow<Api>, props?: ZotchClientProps): ZotchClient<Api> => {
  return new ZotchClientClass(api as ZotchEndpointDefinitions, props) as any as ZotchClient<Api>
}

export const api = <Api extends ZotchEndpointDefinitions>(api: Narrow<Api>): Api => {
  validateEndpointDefinitions(api as ZotchEndpointDefinitions)
  return api as Api
}

export const isStructuredError = (error: ZotchError): error is ZotchStructuredError => {
  return error.type === ZotchErrorType.Structured
}

export function assertStructuredError<T extends ZotchStructuredErrorProps>(error: ZotchError<T>): asserts error is ZotchStructuredError<T> {
  Assertions.assert(isStructuredError(error))
}

// FUTURE commenting this out for now but maybe an interesting idea with more thought behind it?
// export const makeCrudApi = <T extends string, S extends Zod.ZodObject<Zod.ZodRawShape>>(resource: T, schema: S) => {
//   type Schema = Zod.input<S>
//   const capitalizedResource = Strings.capitalize(resource)
//
//   return api({
//     [`get${capitalizedResource}`]: {
//       method: 'get',
//       path: `/${resource}s/:id`,
//       description: `Get a ${resource}`,
//       response: schema,
//     },
//     [`create${capitalizedResource}`]: {
//       method: 'post',
//       path: `/${resource}s`,
//       description: `Create a ${resource}`,
//       body: schema.partial(),
//       response: schema,
//     },
//     [`update${capitalizedResource}`]: {
//       method: 'put',
//       path: `/${resource}s/:id`,
//       description: `Update a ${resource}`,
//       body: schema,
//       response: schema,
//     },
//     [`patch${capitalizedResource}`]: {
//       method: 'patch',
//       path: `/${resource}s/:id`,
//       description: `Patch a ${resource}`,
//       body: schema.partial(),
//       response: schema,
//     },
//     [`delete${capitalizedResource}`]: {
//       method: 'delete',
//       path: `/${resource}s/:id`,
//       description: `Delete a ${resource}`,
//       response: schema,
//     },
//   })
// }
