import { Application } from '@simulacrum/common/application'
import { BessemerClientProvider, ClientApplicationType } from '@bessemer/framework'
import { CoreApplication } from '@bessemer/core/application'
import { CoreClientProvider } from '@bessemer/core/application/client'

export type ClientApplication = ClientApplicationType<Application> & CoreApplication & {}

export const ApplicationClientProvider: BessemerClientProvider<Application, ClientApplication> = {
  useTags: CoreClientProvider.useTags,
  useInitializeClient: (initialClient) => {
    const coreClient = CoreClientProvider.useInitializeClient(initialClient)
    return {
      ...coreClient,
      ...initialClient,
    }
  },
}
