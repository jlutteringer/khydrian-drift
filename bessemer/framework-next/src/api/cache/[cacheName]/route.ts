import { Routes } from '@bessemer/framework-next'
import { NextRequest, NextResponse } from 'next/server'
import { Caches } from '@bessemer/framework'
import { CacheDetail } from '@bessemer/client/cache/types'
import { Objects } from '@bessemer/cornerstone'
import { BessemerNextApplicationContext } from '@bessemer/framework-next/application'

export const GET = Routes.route(
  async (
    context: BessemerNextApplicationContext,
    _: NextRequest,
    { params }: { params: Promise<{ cacheName: string }> }
  ): Promise<NextResponse<CacheDetail>> => {
    const cacheName = (await params).cacheName
    const cacheDetail = await Caches.getCacheDetails(cacheName, context)

    if (Objects.isNil(cacheDetail)) {
      return NextResponse.json<any>({ error: `Cache: [${cacheName}] Not Found` }, { status: 404 })
    }

    return NextResponse.json(cacheDetail)
  }
)
