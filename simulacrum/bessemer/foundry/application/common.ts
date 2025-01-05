import { BessemerRuntimeModule } from '@bessemer/framework'
import { CoreRuntimeModule } from '@bessemer/core/application/common'
import { FoundryApplicationContext, FoundryOptions } from '@bessemer/foundry/application'

export const FoundryRuntimeModule: BessemerRuntimeModule<FoundryApplicationContext, FoundryOptions> = {
  initializeRuntime: CoreRuntimeModule.initializeRuntime,
}
