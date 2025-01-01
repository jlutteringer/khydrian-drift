import { ApplicationRuntimeType, BessemerRuntimeModule, PublicOptions } from '@bessemer/framework'
import { CoreApplication, CoreOptions } from '@bessemer/core/application/index'
import { BaseRuntimeModule } from '@bessemer/framework/application/common'

export const CoreRuntimeModule: BessemerRuntimeModule<CoreApplication, CoreOptions> = {
  initializeRuntime: (options: PublicOptions<CoreOptions>): ApplicationRuntimeType<CoreApplication> => {
    return { ...BaseRuntimeModule.initializeRuntime(options), coreRuntimeTest: () => 'Hello from Core' }
  },
}
