import { ApplicationRuntimeType, BessemerApplication, BessemerApplicationModule, BessemerOptions, Environments } from '@bessemer/framework'

export const BaseApplicationModule: BessemerApplicationModule<BessemerApplication, BessemerOptions> = {
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
