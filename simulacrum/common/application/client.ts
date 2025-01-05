import { ApplicationContext, ClientContext } from '@simulacrum/common/application'
import { BessemerClientModule } from '@bessemer/framework'
import { CoreClientModule } from '@bessemer/core/application/client'
import { Objects } from '@bessemer/cornerstone'

export const ApplicationClientModule: BessemerClientModule<ApplicationContext, ClientContext> = {
  useTags: CoreClientModule.useTags,
  useInitializeClient: (initialClient): ClientContext => {
    const coreClient = CoreClientModule.useInitializeClient(initialClient)
    return Objects.merge(coreClient, initialClient, {})
  },
}
