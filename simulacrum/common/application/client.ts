import { ApplicationContext, ClientContext } from '@simulacrum/common/application'
import { BessemerClientModule } from '@bessemer/framework'
import { Objects } from '@bessemer/cornerstone'
import { FoundryClientModule } from '@bessemer/foundry/application/client'

export const ApplicationClientModule: BessemerClientModule<ApplicationContext, ClientContext> = {
  useTags: FoundryClientModule.useTags,
  useInitializeClient: (initialClient): ClientContext => {
    const coreClient = FoundryClientModule.useInitializeClient(initialClient)
    return Objects.merge(coreClient, initialClient, {})
  },
}
