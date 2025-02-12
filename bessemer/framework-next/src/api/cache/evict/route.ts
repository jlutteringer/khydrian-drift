import { Routes } from '@bessemer/framework-next'
import { CoreApplicationContext } from '@bessemer/core/application'
import { NextRequest, NextResponse } from 'next/server'
import { Caches } from '@bessemer/framework'
import { CacheEvictRequest } from '@bessemer/client/cache/types'

export const POST = Routes.route(async (context: CoreApplicationContext, request: NextRequest) => {
  const payload: CacheEvictRequest = await request.json()
  await Caches.evictValues(payload, context)

  return NextResponse.json({ status: 'Ok!' })
})
