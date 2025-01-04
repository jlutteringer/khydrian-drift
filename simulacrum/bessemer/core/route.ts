import { RouteErrorHandler } from '@bessemer/framework/route'
import { CoreApplicationContext } from '@bessemer/core/application'
import { ErrorEvents, Loggers, Objects, Strings } from '@bessemer/cornerstone'
import { Codex, Tiptap } from '@bessemer/core/index'
import { ReferenceType } from '@bessemer/cornerstone/reference'
import { NextRequest, NextResponse } from 'next/server'
import { ContentReference } from '@bessemer/cornerstone/content'

const logger = Loggers.child('RouteErrorHandler')

export const CoreRouteErrorHandler: RouteErrorHandler<CoreApplicationContext> = async (
  error: unknown,
  context: CoreApplicationContext,
  request: NextRequest
) => {
  logger.error(() => `Handling error at endpoint: ${request.url}`, { error })

  let errorEvent = ErrorEvents.from(error)
  const content = await Codex.fetchText(errorEvent.code as ReferenceType<ContentReference>, context)

  if (Objects.isPresent(content)) {
    // JOHN have a utility that combines these things
    // JOHN should we introduce the notion of context in message resolution? ie... a message on a page vs. a message on the api response should be different...
    // could internationalization also hook into this same mechanism? property tags?
    let message = Tiptap.jsonToString(content.data, context)
    message = Strings.replacePlaceholders(message, { ...errorEvent.attributes })

    errorEvent = { ...errorEvent, message }
  }

  const statusCode = Objects.getAttribute(errorEvent.attributes, ErrorEvents.HttpStatusCodeAttribute) ?? 500
  return NextResponse.json(errorEvent, { status: statusCode })
}
