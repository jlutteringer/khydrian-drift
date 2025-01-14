'use client'

import { usePathname } from 'next/navigation'
import { ContentElement } from '@bessemer/core/codex/component/ContentElement'

export const TestClientComponent = () => {
  const pathname = usePathname()
  // const clientApplication = useClientContext()
  // console.log('clientApplication.test', clientApplication.client.runtime.test())
  // console.log('clientApplication.coreRuntimeTest', clientApplication.client.runtime.coreRuntimeTest())
  // console.log('client', clientApplication)
  return (
    <div>
      <ContentElement contentKey="test-content-client" />
    </div>
  )
}
