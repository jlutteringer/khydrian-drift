'use client'

import { Application, ApplicationOptions } from '@simulacrum/common/application'
import { Bessemer, DehydratedApplicationType, PublicOptions } from '@bessemer/framework'
import { usePathname } from 'next/navigation'
import { ApplicationRuntimeProvider } from '@simulacrum/common/application/common'
import { ApplicationClientProvider } from '@simulacrum/common/application/client'

export const TestClientComponent = ({
  value,
  application,
  options,
}: {
  value: string
  application: DehydratedApplicationType<Application>
  options: PublicOptions<ApplicationOptions>
}) => {
  const pathname = usePathname()

  const clientRuntime = ApplicationRuntimeProvider.initializeRuntime(options)
  const client = ApplicationClientProvider.useInitializeClient(Bessemer.hydrateApplication(application, clientRuntime))

  console.log('pathname', pathname)
  console.log('clientApplication.test', client.client.runtime.test())
  console.log('clientApplication.coreRuntimeTest', client.client.runtime.coreRuntimeTest())
  console.log('client', client)

  return <div>{value}</div>
}
