import { NextRequest, NextResponse } from 'next/server'
import { Bessemer, BessemerApplicationContext } from '@bessemer/framework'
import { GenericRecord } from '@bessemer/cornerstone/types'
import { Tags } from '@bessemer/cornerstone'
import { ApplicationRuntime, ApplicationRuntimeTag } from '@bessemer/framework/runtime'

export type NextRouteHandler<Params extends GenericRecord = {}> = (
  request: NextRequest,
  context: { params: Promise<Params> }
) => Promise<NextResponse>

export type RouteHandler<ApplicationContext extends BessemerApplicationContext = BessemerApplicationContext, Params extends GenericRecord = {}> = (
  context: ApplicationContext,
  request: NextRequest,
  nextContext: { params: Promise<Params> }
) => Promise<NextResponse>

export type RouteErrorHandler<ApplicationContext extends BessemerApplicationContext = BessemerApplicationContext> = (
  error: unknown,
  context: ApplicationContext,
  request: NextRequest,
  nextContext: { params: Promise<GenericRecord> }
) => Promise<NextResponse>

export const DefaultRouteErrorHandler: RouteErrorHandler = (error: unknown) => {
  throw error
}

export const route = <ApplicationContext extends BessemerApplicationContext, Params extends GenericRecord>(
  handler: RouteHandler<ApplicationContext, Params>
): NextRouteHandler<Params> => {
  return async (request: NextRequest, nextContext) => {
    const context = await Bessemer.getApplication<ApplicationContext>([Tags.tag(ApplicationRuntimeTag, ApplicationRuntime.Api)])

    try {
      return await handler(context, request, nextContext)
    } catch (e) {
      return await context.route.errorHandler(e, context, request, nextContext)
    }
  }
}
