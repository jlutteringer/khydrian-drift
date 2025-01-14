import { use } from 'react'
import { ApplicationContext } from '@simulacrum/common/application'
import { BessemerNext } from '@bessemer/framework-next'

const CampaignsPage = () => {
  const application = use(BessemerNext.getApplication<ApplicationContext>())
  return <div>Page Under Construction</div>
}

export default CampaignsPage
