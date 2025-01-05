import { Routes } from '@bessemer/framework'
import { CoreApplicationContext } from '@bessemer/core/application'
import { Codex } from '@bessemer/core'
import { Objects, Urls } from '@bessemer/cornerstone'
import { NextRequest, NextResponse } from 'next/server'
import { Tag } from '@bessemer/cornerstone/tag'

export const GET = Routes.route(
  async (context: CoreApplicationContext, request: NextRequest, { params }: { params: Promise<{ contentKey: string }> }) => {
    const contentKey = (await params).contentKey
    const tags = Urls.getJsonParameter<Array<Tag>>(request.url, 'tags') ?? []
    const content = await Codex.fetchContentByKey(contentKey, context, { tags })

    if (Objects.isNil(content)) {
      return NextResponse.json({ error: `Content Item: [${contentKey}] Not Found` }, { status: 404 })
    }

    return NextResponse.json({ content })
  }
)
