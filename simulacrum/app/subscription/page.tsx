import * as React from 'react'
import { Bessemer } from '@bessemer/framework'
import { ApplicationContext, ApplicationOptions } from '@simulacrum/common/application'

const SubscriptionPage = () => {
  const application = Bessemer.getInstance<ApplicationContext, ApplicationOptions>()

  return <div>Page Under Construction</div>
}

export default SubscriptionPage
