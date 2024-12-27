import { ApplicationRuntimeType, BessemerRuntimeProvider, PublicOptions } from '@bessemer/framework'
import { CoreApplication, CoreOptions } from '@bessemer/core/application/index'
import { BaseRuntimeProvider } from '@bessemer/framework/application/common'

export const CoreRuntimeProvider: BessemerRuntimeProvider<CoreApplication, CoreOptions> = {
  initializeRuntime: (options: PublicOptions<CoreOptions>): ApplicationRuntimeType<CoreApplication> => {
    return { ...BaseRuntimeProvider.initializeRuntime(options), coreRuntimeTest: () => 'Hello from Core' }
  },
}
