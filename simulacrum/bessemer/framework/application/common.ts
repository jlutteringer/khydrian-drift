import { ApplicationRuntimeType, BessemerApplication, BessemerOptions, BessemerRuntimeProvider, PublicOptions } from '@bessemer/framework'

export const BaseRuntimeProvider: BessemerRuntimeProvider<BessemerApplication, BessemerOptions> = {
  initializeRuntime: (_: PublicOptions<BessemerOptions>): ApplicationRuntimeType<BessemerApplication> => {
    return {}
  },
}
