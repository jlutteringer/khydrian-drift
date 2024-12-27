import { ApplicationRuntimeType, BessemerApplication, BessemerApplicationProvider, BessemerOptions, Environments } from '@bessemer/framework'
import { PropertyTag } from '@bessemer/cornerstone/property'

export const BaseApplicationProvider: BessemerApplicationProvider<BessemerApplication, BessemerOptions> = {
  getTags: async () => {
    return []
  },
  initializeApplication: async (
    _: BessemerOptions,
    runtime: ApplicationRuntimeType<BessemerApplication>,
    tags: Array<PropertyTag>
  ): Promise<BessemerApplication> => {
    return {
      client: {
        environment: Environments.getEnvironment(),
        tags,
        runtime: runtime,
      },
    }
  },
}
