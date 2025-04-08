import { Routes } from '@bessemer/framework-next'
import { NextRequest, NextResponse } from 'next/server'
import { Caches } from '@bessemer/framework'
import { CacheEvictRequest } from '@bessemer/client/cache/types'
import { BessemerNextApplicationContext } from '@bessemer/framework-next/application'

// JOHN consider - should the evict endpoint be able to infer the application sector for you? is this valuable?
export const POST = Routes.route(async (context: BessemerNextApplicationContext, request: NextRequest) => {
  const payload: CacheEvictRequest = await request.json()
  await Caches.evictValues(payload, context)

  return NextResponse.json({ status: 'Ok!' })
})
