import { Bessemer } from '@bessemer/framework'
import { ApplicationContext } from '@simulacrum/common/application'
import { use } from 'react'

export const TestServerComponent = () => {
  // console.log('TestServerComponent')

  const application = use(Bessemer.getApplication<ApplicationContext>())

  // console.log('application.test', application.client.runtime.test())
  // console.log('application.coreRuntimeTest', application.client.runtime.coreRuntimeTest())
  // console.log('application', application)
  // return <ContentElement contentKey="test-content" />
  return 'hello'
}
