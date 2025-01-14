import { ApplicationRuntimeType, BessemerRuntimeModule, PublicOptions } from '@bessemer/framework'
import { CoreApplicationContext, CoreOptions } from '@bessemer/core/application'
import { Codex } from '@bessemer/core'
import { BessemerNextRuntimeModule } from '@bessemer/framework-next/application/common'

export const CoreRuntimeModule: BessemerRuntimeModule<CoreApplicationContext, CoreOptions> = {
  initializeRuntime: (options: PublicOptions<CoreOptions>): ApplicationRuntimeType<CoreApplicationContext> => {
    return { ...BessemerNextRuntimeModule.initializeRuntime(options), codex: Codex.defaultRuntime() }
  },
}
