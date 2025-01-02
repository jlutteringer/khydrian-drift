'use client'

import { usePathname } from 'next/navigation'
import { useClientApplication } from '@simulacrum/ui/application/use-client-application'
import { Logger } from '@bessemer/cornerstone'

export const TestClientComponent = () => {
  const pathname = usePathname()
  const clientApplication = useClientApplication()

  Logger.info('pathname', pathname)
  // console.log('clientApplication.test', clientApplication.client.runtime.test())
  // console.log('clientApplication.coreRuntimeTest', clientApplication.client.runtime.coreRuntimeTest())
  // console.log('client', clientApplication)
  return <div>Hello</div>
}
