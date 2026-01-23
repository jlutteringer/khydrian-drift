import express, { RouterOptions } from 'express'
import { z, ZodObject } from 'zod'
import { ZodiosEndpointDefinitions } from '@bessemer/zodios'
import { Narrow } from '@bessemer/zodios/utils.types'
import { WithZodiosContext, ZodiosApp, ZodiosAppOptions, ZodiosRequestHandler, ZodiosRouter, ZodiosRouterOptions } from './zodios.types'
import { injectParametersValidators } from './zodios-validator'

export const zodiosApp = <Api extends ZodiosEndpointDefinitions = any, Context extends ZodObject<any> = ZodObject<any>>(
  api?: Narrow<Api>,
  options: ZodiosAppOptions<Context> = {}
): ZodiosApp<Api, Context> => {
  const { express: app = express(), enableJsonBodyParser = true, validationErrorHandler = defaultErrorHandler } = options
  if (enableJsonBodyParser) {
    app.use(express.json())
  }
  if (api) {
    injectParametersValidators(api, app, validationErrorHandler)
  }
  return app as unknown as ZodiosApp<Api, Context>
}

export const zodiosRouter = <Api extends ZodiosEndpointDefinitions, Context extends ZodObject<any> = ZodObject<any>>(
  api: Narrow<Api>,
  options: RouterOptions & ZodiosRouterOptions<Context> = {}
): ZodiosRouter<Api, Context> => {
  const { validationErrorHandler = defaultErrorHandler, ...routerOptions } = options
  const router = options?.router ?? express.Router(routerOptions)
  injectParametersValidators(api, router, validationErrorHandler)
  return router as unknown as ZodiosRouter<Api, Context>
}

export type ZodiosExpressImplementation<Api extends ZodiosEndpointDefinitions> = {
  [Path in Api[number]['path']]: {
    [Method in Extract<Api[number], { path: Path }>['method']]: ZodiosRequestHandler<Api, ZodObject<any>, Method, Path>
  }
}

export const zodiosRouter2 = <Api extends ZodiosEndpointDefinitions, Context extends ZodObject<any> = ZodObject<any>>(
  api: Narrow<Api>,
  implementation: ZodiosExpressImplementation<Api>,
  options: RouterOptions & ZodiosRouterOptions<Context> = {}
): express.Router => {
  const { validationErrorHandler = defaultErrorHandler, ...routerOptions } = options
  const router = express.Router(routerOptions)
  return router
}

export class ZodiosContext<Context extends ZodObject<any>> {
  constructor(public context?: Context) {}

  app = <Api extends ZodiosEndpointDefinitions = any>(api?: Narrow<Api>, options: ZodiosAppOptions<Context> = {}): ZodiosApp<Api, Context> => {
    return zodiosApp<Api, Context>(api, options)
  }

  router = <Api extends ZodiosEndpointDefinitions>(
    api: Narrow<Api>,
    options?: RouterOptions & ZodiosRouterOptions<Context>
  ): ZodiosRouter<Api, Context> => {
    return zodiosRouter<Api, Context>(api, options)
  }
}

export const zodiosContext = <Context extends ZodObject<any> = ZodObject<any>>(context?: Context): ZodiosContext<Context> => {
  return new ZodiosContext(context)
}

export const defaultErrorHandler = <Context extends ZodObject<any>>(
  err: {
    context: string
    error: z.ZodIssue[]
  },
  req: WithZodiosContext<express.Request, Context>,
  res: express.Response,
  next: express.NextFunction
) => {
  res.status(400).json(err)
}
