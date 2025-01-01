import { Application } from '@simulacrum/common/application'
import { BessemerClientModule, ClientApplicationType } from '@bessemer/framework'
import { CoreApplication } from '@bessemer/core/application'
import { CoreClientModule } from '@bessemer/core/application/client'
import { Objects } from '@bessemer/cornerstone'

export type ClientApplication = ClientApplicationType<Application> & CoreApplication & {}

export const ApplicationClientModule: BessemerClientModule<Application, ClientApplication> = {
  useTags: CoreClientModule.useTags,
  useInitializeClient: (initialClient) => {
    const coreClient = CoreClientModule.useInitializeClient(initialClient)
    return Objects.merge(coreClient, initialClient, {})
  },
}
