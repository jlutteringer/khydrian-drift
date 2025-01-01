'use client'

import { usePathname } from 'next/navigation'
import { ClientApplication } from '@simulacrum/common/application/client'
import { useClientApplication } from '@bessemer/framework/use-bessemer-client'

export const TestClientComponent = () => {
  const pathname = usePathname()
  const clientApplication = useClientApplication<ClientApplication>()

  console.log('pathname', pathname)
  console.log('clientApplication.test', clientApplication.client.runtime.test())
  console.log('clientApplication.coreRuntimeTest', clientApplication.client.runtime.coreRuntimeTest())
  console.log('client', clientApplication)
  return <div>Hello</div>
}
