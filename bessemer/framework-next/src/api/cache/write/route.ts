import { Routes } from '@bessemer/framework-next'
import { NextRequest, NextResponse } from 'next/server'
import { Caches } from '@bessemer/framework'
import { CacheWriteRequest } from '@bessemer/client/cache/types'
import { BessemerNextApplicationContext } from '@bessemer/framework-next/application'

export const POST = Routes.route(async (context: BessemerNextApplicationContext, request: NextRequest) => {
  const payload: CacheWriteRequest = await request.json()
  await Caches.writeValues(payload, context)

  return NextResponse.json({ status: 'Ok!' })
})
