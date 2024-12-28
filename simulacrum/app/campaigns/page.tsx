import * as React from 'react'
import { Bessemer } from '@bessemer/framework'
import { Application } from '@simulacrum/common/application'

const CampaignsPage = () => {
  const application = Bessemer.getApplication<Application>()
  console.log(application)

  return <div>Page Under Construction</div>
}

export default CampaignsPage
