import * as React from 'react'
import { use } from 'react'
import { Bessemer } from '@bessemer/framework'
import { ApplicationContext } from '@simulacrum/common/application'

const SubscriptionPage = () => {
  const application = use(Bessemer.getApplication<ApplicationContext>())

  return <div>Page Under Construction</div>
}

export default SubscriptionPage
