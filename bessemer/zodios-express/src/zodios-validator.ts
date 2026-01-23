import express from 'express'
import { ZodiosEndpointDefinition, ZodiosEndpointDefinitions } from '@bessemer/zodios'
import Zod, { ZodObject, ZodType } from 'zod'
import { ZodiosRouterValidationErrorHandler } from './zodios.types'
import { HttpMethods, Urls, ZodUtil } from '@bessemer/cornerstone'
import { ZodTypeKind } from '@bessemer/cornerstone/zod-util'
import { HttpMethod } from '@bessemer/cornerstone/net/http-method'
import { HttpRequest } from '@bessemer/cornerstone/net/http-request'

const validateParam = async (schema: ZodType, parameter: unknown) => {
  if (!ZodUtil.isType(schema, ZodTypeKind.String) && parameter && typeof parameter === 'string') {
    return Zod.preprocess((x) => {
      try {
        return JSON.parse(x as string)
      } catch {
        return x
      }
    }, schema).safeParseAsync(parameter)
  }
  return schema.safeParseAsync(parameter)
}

const validateEndpointMiddleware = (endpoint: ZodiosEndpointDefinition) => {
  return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const url = Urls.from(req.url)

    const validatedRequest: HttpRequest = {
      method: HttpMethods.from(req.method),
      url,
      pathParameters: { ...req.params },
      queryParameters: url.location.parameters,
      body: req.body,
      headers: { ...req.headers },
    }

    for (let parameter of endpoint.parameters!) {
      let schema = parameter.schema

      switch (parameter.type) {
        case 'Body':
          {
            const result = await schema.safeParseAsync(req.body)
            if (!result.success) {
              return next({
                context: 'body',
                error: result.error.issues,
              })
            }

            validatedRequest.body = result.data
          }
          break
        case 'Path':
          {
            const result = await validateParam(schema, req.params[parameter.name])
            if (!result.success) {
              return next({
                context: `path.${parameter.name}`,
                error: result.error.issues,
              })
            }

            validatedRequest.parameters[parameter.name] = result.data
          }
          break
        case 'Query':
          {
            const result = await validateParam(schema, req.query[parameter.name])
            if (!result.success) {
              return next({
                context: `query.${parameter.name}`,
                error: result.error.issues,
              })
            }

            validatedRequest.queryParameters[parameter.name] = result.data
          }
          break
        case 'Header':
          {
            const result = await parameter.schema.safeParseAsync(req.get(parameter.name))
            if (!result.success) {
              return next({
                context: `header.${parameter.name}`,
                error: result.error.issues,
              })
            }

            validatedRequest.headers[parameter.name] = result.data
          }
          break
      }
    }

    ;(req as any).validatedRequest = validatedRequest
    next()
  }
}

/**
 * monkey patch express.Router to add inject the validation middlewares after the route is matched
 * @param api - the api definition
 * @param router - express router to patch
 */
export const injectParametersValidators = <Context extends ZodObject<any>>(
  api: ZodiosEndpointDefinitions,
  router: express.Router,
  validationErrorHandler: ZodiosRouterValidationErrorHandler<Context>
) => {
  for (let method of Object.values(HttpMethod)) {
    const savedMethod = router[method].bind(router)

    // @ts-ignore
    router[method] = (path: string, ...handlers: any[]) => {
      const endpoint = api.find((endpoint) => endpoint.method === method && endpoint.path === path)
      if (endpoint && endpoint.parameters) {
        handlers = [validateEndpointMiddleware(endpoint), validationErrorHandler, ...handlers]
      }
      return savedMethod(path, ...handlers)
    }
  }
}
