import { ApplicationRuntimeType, BessemerApplication, BessemerOptions, BessemerRuntimeModule, PublicOptions } from '@bessemer/framework'

export const BaseRuntimeModule: BessemerRuntimeModule<BessemerApplication, BessemerOptions> = {
  initializeRuntime: (_: PublicOptions<BessemerOptions>): ApplicationRuntimeType<BessemerApplication> => {
    return {}
  },
}
