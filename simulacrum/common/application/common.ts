import { ApplicationRuntimeType, BessemerRuntimeModule, PublicOptions } from '@bessemer/framework'
import { ApplicationContext, ApplicationOptions } from '@simulacrum/common/application/index'
import { FoundryRuntimeModule } from '@bessemer/foundry/application/common'

export const ApplicationRuntimeModule: BessemerRuntimeModule<ApplicationContext, ApplicationOptions> = {
  initializeRuntime: (options: PublicOptions<ApplicationOptions>): ApplicationRuntimeType<ApplicationContext> => {
    return { ...FoundryRuntimeModule.initializeRuntime(options), test: () => 'Hello from the Application' }
  },
}
