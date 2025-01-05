import { RouteErrorHandler } from '@bessemer/framework/route'
import { CoreApplicationContext } from '@bessemer/core/application'
import { ErrorEvents, Loggers, Objects, Strings, Tags } from '@bessemer/cornerstone'
import { Codex, Tiptap } from '@bessemer/core/index'
import { NextRequest, NextResponse } from 'next/server'
import { ContentKey } from '@bessemer/cornerstone/content'
import { ApplicationRuntime, ApplicationRuntimeTag } from '@bessemer/framework/runtime'

const logger = Loggers.child('RouteErrorHandler')

export const CoreRouteErrorHandler: RouteErrorHandler<CoreApplicationContext> = async (
  error: unknown,
  context: CoreApplicationContext,
  request: NextRequest
) => {
  console.log('CoreRouteErrorHandler', error)
  logger.error(() => `Handling error at endpoint: ${request.url}`, { error })

  let errorEvent = ErrorEvents.from(error)
  const content = await Codex.fetchTextByKey(errorEvent.code as ContentKey, [Tags.tag(ApplicationRuntimeTag, ApplicationRuntime.Api)], context)

  if (Objects.isPresent(content)) {
    // JOHN have a utility that combines these things
    // JOHN how do we establish common property context for placeholder resolution?
    // JOHN should we introduce the notion of context in message resolution? ie... a message on a page vs. a message on the api response should be different...
    // could internationalization also hook into this same mechanism? property tags?
    let message = Tiptap.jsonToString(content.data, context)
    message = Strings.replacePlaceholders(message, { ...errorEvent.attributes })

    errorEvent = { ...errorEvent, message }
  }

  const statusCode = Objects.getAttribute(errorEvent.attributes, ErrorEvents.HttpStatusCodeAttribute) ?? 500
  return NextResponse.json(errorEvent, { status: statusCode })
}
