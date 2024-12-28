import { Bessemer } from '@bessemer/framework'
import { Application } from '@simulacrum/common/application'

export const TestServerComponent = () => {
  console.log('TestServerComponent')

  const application = Bessemer.getApplication<Application>()

  console.log('application.test', application.client.runtime.test())
  console.log('application.coreRuntimeTest', application.client.runtime.coreRuntimeTest())
  console.log('application', application)
  return 'hello'
}
