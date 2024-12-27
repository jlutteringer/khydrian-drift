import { ApplicationRuntimeType, BessemerRuntimeProvider, PublicOptions } from '@bessemer/framework'
import { Application, ApplicationOptions } from '@simulacrum/common/application/index'
import { CoreRuntimeProvider } from '@bessemer/core/application/common'

export const ApplicationRuntimeProvider: BessemerRuntimeProvider<Application, ApplicationOptions> = {
  initializeRuntime: (options: PublicOptions<ApplicationOptions>): ApplicationRuntimeType<Application> => {
    return { ...CoreRuntimeProvider.initializeRuntime(options), test: () => 'Hello from the Application' }
  },
}
