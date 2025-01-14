import { ApplicationContext } from '@simulacrum/common/application'
import { use } from 'react'
import { ContentElement } from '@bessemer/core/codex/component/ContentElement'
import { BessemerNext } from '@bessemer/framework-next'

export const TestServerComponent = () => {
  // console.log('TestServerComponent')

  const application = use(BessemerNext.getApplication<ApplicationContext>())

  // console.log('application.test', application.client.runtime.test())
  // console.log('application.coreRuntimeTest', application.client.runtime.coreRuntimeTest())
  // console.log('application', application)
  return <ContentElement contentKey="test-content-server" />
}
