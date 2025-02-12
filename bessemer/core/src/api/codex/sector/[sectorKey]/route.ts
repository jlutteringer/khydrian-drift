import { Routes } from '@bessemer/framework-next'
import { CoreApplicationContext } from '@bessemer/core/application'
import { Codex } from '@bessemer/core'
import { Urls } from '@bessemer/cornerstone'
import { NextRequest, NextResponse } from 'next/server'
import { Tag } from '@bessemer/cornerstone/tag'

export const GET = Routes.route(
  async (context: CoreApplicationContext, request: NextRequest, { params }: { params: Promise<{ sectorKey: string }> }) => {
    const sectorKey = (await params).sectorKey

    const url = Urls.parse(request.url)
    const type = Urls.getParameter(url, 'type')
    const tags = Urls.getJsonParameter<Array<Tag>>(url, 'tags')
    const content = await Codex.fetchContentBySector(sectorKey, context, { type, tags })

    return NextResponse.json(content)
  }
)
