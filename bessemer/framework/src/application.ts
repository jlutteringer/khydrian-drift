import {
  ApplicationRuntimeType,
  BessemerApplicationContext,
  BessemerApplicationModule,
  BessemerOptions,
  Environments
} from '@bessemer/framework'
import { Loggers } from '@bessemer/cornerstone'

export const BaseApplicationModule: BessemerApplicationModule<BessemerApplicationContext, BessemerOptions> = {
  globalTags: () => {
    return [Environments.getEnvironmentTag()]
  },
  // TODO I can start to see the importance of a global context... lots of stuff that probably doesn't need to vary on profile
  configure: (options: BessemerOptions): void => {
    Loggers.configure(options.logger)
  },
  applicationTags: async () => {
    return []
  },
  initializeApplication: async (
    _: BessemerOptions,
    runtime: ApplicationRuntimeType<BessemerApplicationContext>
  ): Promise<BessemerApplicationContext> => {
    const application: BessemerApplicationContext = {
      client: {
        environment: Environments.getEnvironment(),
        tags: [],
        runtime: runtime,
      },
    }

    return application
  },
}
