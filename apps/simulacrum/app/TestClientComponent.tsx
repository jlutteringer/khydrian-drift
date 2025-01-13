'use client'

import { usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useCoreTest } from '@bessemer/core/use-core-test'
import { useTest } from '@bessemer/framework/hooks/use-test'

export const TestClientComponent = () => {
  const pathname = usePathname()
  // const clientApplication = useClientContext()
  const blah1 = useCoreTest()
  console.log(blah1)

  const blah2 = useQuery({ queryKey: ['test test'], queryFn: () => { return 'hello' }})
  console.log(blah2.data)
  useTest()
  // console.log('clientApplication.test', clientApplication.client.runtime.test())
  // console.log('clientApplication.coreRuntimeTest', clientApplication.client.runtime.coreRuntimeTest())
  // console.log('client', clientApplication)
  return (
    <div>
      Hello
      {/*<ContentElement contentKey="test-content" />*/}
    </div>
  )
}
