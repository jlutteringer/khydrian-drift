import { Routes } from '@bessemer/framework'
import { CoreApplicationContext } from '@bessemer/core/application'
import { Codex } from '@bessemer/core'
import { ErrorEvents, Objects } from '@bessemer/cornerstone'
import { NextRequest, NextResponse } from 'next/server'
import { ErrorEventException } from '@bessemer/cornerstone/error-event'

export const revalidate = 60

// JOHN global error handling for routes
export const GET = Routes.route(async (context: CoreApplicationContext, _: NextRequest, { params }: { params: Promise<{ contentId: string }> }) => {
  const contentId = (await params).contentId
  const content = await Codex.fetchText(contentId, context)

  if (Objects.isNil(content)) {
    return NextResponse.json({ error: `Content Item: [${contentId}] Not Found` }, { status: 404 })
  }

  if (true) {
    throw new ErrorEventException(ErrorEvents.unhandled(), new Error('blah'))
  }

  return NextResponse.json({ content })
})
