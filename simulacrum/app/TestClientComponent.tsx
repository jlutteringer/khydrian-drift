'use client'

import { usePathname } from 'next/navigation'
import { useClientContext } from '@simulacrum/ui/application/use-client-context'
import { Loggers } from '@bessemer/cornerstone'
import { ContentText } from '@bessemer/foundry/component/ContentText'

export const TestClientComponent = () => {
  const pathname = usePathname()
  const clientApplication = useClientContext()

  Loggers.info('Aha!')
  // console.log('clientApplication.test', clientApplication.client.runtime.test())
  // console.log('clientApplication.coreRuntimeTest', clientApplication.client.runtime.coreRuntimeTest())
  // console.log('client', clientApplication)
  return (
    <div>
      Hello
      <ContentText />
    </div>
  )
}
