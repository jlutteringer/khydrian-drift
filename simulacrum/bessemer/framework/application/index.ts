import { ApplicationRuntimeType, BessemerApplication, BessemerApplicationProvider, BessemerOptions, Environments } from '@bessemer/framework'

export const BaseApplicationProvider: BessemerApplicationProvider<BessemerApplication, BessemerOptions> = {
  getTags: async () => {
    return [Environments.getEnvironmentTag()]
  },
  initializeApplication: async (_: BessemerOptions, runtime: ApplicationRuntimeType<BessemerApplication>): Promise<BessemerApplication> => {
    return {
      client: {
        tags: [],
        environment: Environments.getEnvironment(),
        runtime: runtime,
      },
    }
  },
}
