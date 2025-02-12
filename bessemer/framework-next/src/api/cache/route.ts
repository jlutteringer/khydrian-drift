import { Routes } from '@bessemer/framework-next'
import { CoreApplicationContext } from '@bessemer/core/application'
import { NextResponse } from 'next/server'
import { Caches } from '@bessemer/framework'
import { CacheSummary } from '@bessemer/client/cache/types'

export const GET = Routes.route(async (context: CoreApplicationContext): Promise<NextResponse<Array<CacheSummary>>> => {
  const caches = await Caches.getCaches(context)
  return NextResponse.json(caches)
})
