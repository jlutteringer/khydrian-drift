import { Routes } from '@bessemer/framework-next'
import { CoreApplicationContext } from '@bessemer/core/application'
import { Codex } from '@bessemer/core'
import { Objects } from '@bessemer/cornerstone'
import { NextRequest, NextResponse } from 'next/server'

export const GET = Routes.route(async (context: CoreApplicationContext, _: NextRequest, { params }: { params: Promise<{ contentId: string }> }) => {
  const contentId = (await params).contentId
  const content = await Codex.fetchTextById(contentId, context)

  if (Objects.isNil(content)) {
    return NextResponse.json({ error: `Content Item: [${contentId}] Not Found` }, { status: 404 })
  }

  return NextResponse.json(content)
})
