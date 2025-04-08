import { Routes } from '@bessemer/framework-next'
import { NextResponse } from 'next/server'
import { Caches } from '@bessemer/framework'
import { CacheSummary } from '@bessemer/client/cache/types'
import { BessemerNextApplicationContext } from '@bessemer/framework-next/application'

export const GET = Routes.route(async (context: BessemerNextApplicationContext): Promise<NextResponse<Array<CacheSummary>>> => {
  const caches = await Caches.getCaches(context)
  return NextResponse.json(caches)
})
