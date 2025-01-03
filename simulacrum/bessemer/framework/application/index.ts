import { ApplicationRuntimeType, BessemerApplicationContext, BessemerApplicationModule, BessemerOptions, Environments } from '@bessemer/framework'
import { Loggers, Objects } from '@bessemer/cornerstone'

export const BaseApplicationModule: BessemerApplicationModule<BessemerApplicationContext, BessemerOptions> = {
  globalProfile: () => {
    return [Environments.getEnvironmentTag()]
  },
  configure: (options: BessemerOptions): void => {
    Loggers.configure(options.logger)
  },
  applicationProfile: async () => {
    return []
  },
  initializeApplication: async (
    _: BessemerOptions,
    runtime: ApplicationRuntimeType<BessemerApplicationContext>
  ): Promise<BessemerApplicationContext> => {
    const application = Objects.merge(global, {
      client: {
        environment: Environments.getEnvironment(),
        profile: [],
        runtime: runtime,
      },
    })

    return application
  },
}
