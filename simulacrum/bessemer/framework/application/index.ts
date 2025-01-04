import { ApplicationRuntimeType, BessemerApplicationContext, BessemerApplicationModule, BessemerOptions, Environments } from '@bessemer/framework'
import { Loggers } from '@bessemer/cornerstone'
import { DefaultRouteErrorHandler } from '@bessemer/framework/route'

export const BaseApplicationModule: BessemerApplicationModule<BessemerApplicationContext, BessemerOptions> = {
  globalProfile: () => {
    return [Environments.getEnvironmentTag()]
  },
  // TODO I can start to see the importance of a global context... lots of stuff that probably doesn't need to vary on profile
  configure: (options: BessemerOptions): void => {
    Loggers.configure(options.logger)
  },
  applicationProfile: async () => {
    return []
  },
  initializeApplication: async (
    options: BessemerOptions,
    runtime: ApplicationRuntimeType<BessemerApplicationContext>
  ): Promise<BessemerApplicationContext> => {
    const application: BessemerApplicationContext = {
      route: {
        errorHandler: options.route?.errorHandler ?? DefaultRouteErrorHandler,
      },
      client: {
        environment: Environments.getEnvironment(),
        profile: [],
        runtime: runtime,
      },
    }

    return application
  },
}
