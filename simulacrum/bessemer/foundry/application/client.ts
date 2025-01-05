import { BessemerClientModule } from '@bessemer/framework'
import { CoreClientModule } from '@bessemer/core/application/client'
import { FoundryApplicationContext, FoundryClientContext } from '@bessemer/foundry/application'

export const FoundryClientModule: BessemerClientModule<FoundryApplicationContext, FoundryClientContext> = {
  useTags: CoreClientModule.useTags,
  useInitializeClient: CoreClientModule.useInitializeClient,
}
