import { ApplicationContext, ClientContext } from '@simulacrum/common/application'
import { BessemerClientModule } from '@bessemer/framework'
import { CoreClientModule } from '@bessemer/core/application/client'
import { Objects } from '@bessemer/cornerstone'

export const ApplicationClientModule: BessemerClientModule<ApplicationContext, ClientContext> = {
  useProfile: CoreClientModule.useProfile,
  useInitializeClient: (initialClient) => {
    const coreClient = CoreClientModule.useInitializeClient(initialClient)
    return Objects.merge(coreClient, initialClient, {})
  },
}
