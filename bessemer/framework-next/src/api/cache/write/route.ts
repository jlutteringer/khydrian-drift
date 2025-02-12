import { Routes } from '@bessemer/framework-next'
import { CoreApplicationContext } from '@bessemer/core/application'
import { NextRequest, NextResponse } from 'next/server'
import { Caches } from '@bessemer/framework'
import { CacheWriteRequest } from '@bessemer/client/cache/types'

export const POST = Routes.route(async (context: CoreApplicationContext, request: NextRequest) => {
  const payload: CacheWriteRequest = await request.json()
  await Caches.writeValues(payload, context)

  return NextResponse.json({ status: 'Ok!' })
})
