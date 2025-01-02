import { ApplicationRuntimeType, BessemerRuntimeModule, PublicOptions } from '@bessemer/framework'
import { ApplicationContext, ApplicationOptions } from '@simulacrum/common/application/index'
import { CoreRuntimeModule } from '@bessemer/core/application/common'

export const ApplicationRuntimeModule: BessemerRuntimeModule<ApplicationContext, ApplicationOptions> = {
  initializeRuntime: (options: PublicOptions<ApplicationOptions>): ApplicationRuntimeType<ApplicationContext> => {
    return { ...CoreRuntimeModule.initializeRuntime(options), test: () => 'Hello from the Application' }
  },
}
