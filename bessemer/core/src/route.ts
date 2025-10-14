import { RouteErrorHandler } from '@bessemer/framework-next/route'
import { CoreApplicationContext } from '@bessemer/core/application'
import { ErrorEvents, Loggers, Objects, Strings } from '@bessemer/cornerstone'
import { Codex, Tiptap } from '@bessemer/core/index'
import { NextRequest, NextResponse } from 'next/server'
import { ContentKey } from '@bessemer/cornerstone/content'
import { Throwable } from '@bessemer/cornerstone/types'

const logger = Loggers.child('RouteErrorHandler')

export const CoreRouteErrorHandler: RouteErrorHandler<CoreApplicationContext> = async (
  error: Throwable,
  context: CoreApplicationContext,
  request: NextRequest
) => {
  logger.error(() => `Handling error at endpoint: ${request.url}`, { error })

  let errorEvent = ErrorEvents.fromThrowable(error)
  const content = await Codex.fetchTextByKey(errorEvent.causes[0]!.code as string as ContentKey, context)

  if (Objects.isPresent(content)) {
    // FUTURE have a utility that combines these things
    // FUTURE how do we establish common property context for placeholder resolution?
    let message = Tiptap.jsonToString(content.data, context)
    message = Strings.replacePlaceholders(message, { ...errorEvent.attributes })

    errorEvent = { ...errorEvent, message }
  }

  const statusCode = Objects.getAttribute(errorEvent.attributes, ErrorEvents.HttpStatusCodeAttribute) ?? 500
  return NextResponse.json(errorEvent, { status: statusCode })
}
