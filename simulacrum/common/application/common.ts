import { ApplicationRuntimeType, BessemerRuntimeModule, PublicOptions } from '@bessemer/framework'
import { Application, ApplicationOptions } from '@simulacrum/common/application/index'
import { CoreRuntimeModule } from '@bessemer/core/application/common'

export const ApplicationRuntimeModule: BessemerRuntimeModule<Application, ApplicationOptions> = {
  initializeRuntime: (options: PublicOptions<ApplicationOptions>): ApplicationRuntimeType<Application> => {
    return { ...CoreRuntimeModule.initializeRuntime(options), test: () => 'Hello from the Application' }
  },
}
