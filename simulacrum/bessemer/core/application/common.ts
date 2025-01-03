import { ApplicationRuntimeType, BessemerRuntimeModule, PublicOptions } from '@bessemer/framework'
import { CoreApplicationContext, CoreOptions } from '@bessemer/core/application/index'
import { BaseRuntimeModule } from '@bessemer/framework/application/common'

export const CoreRuntimeModule: BessemerRuntimeModule<CoreApplicationContext, CoreOptions> = {
  initializeRuntime: (options: PublicOptions<CoreOptions>): ApplicationRuntimeType<CoreApplicationContext> => {
    return { ...BaseRuntimeModule.initializeRuntime(options), coreRuntimeTest: () => 'Hello from Core' }
  },
}
