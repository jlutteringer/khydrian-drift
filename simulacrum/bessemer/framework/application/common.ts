import { ApplicationRuntimeType, BessemerApplicationContext, BessemerOptions, BessemerRuntimeModule, PublicOptions } from '@bessemer/framework'

export const BaseRuntimeModule: BessemerRuntimeModule<BessemerApplicationContext, BessemerOptions> = {
  initializeRuntime: (_: PublicOptions<BessemerOptions>): ApplicationRuntimeType<BessemerApplicationContext> => {
    return {}
  },
}
