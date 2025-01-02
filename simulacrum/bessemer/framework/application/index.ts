import {
  ApplicationRuntimeType,
  BessemerApplicationContext,
  BessemerApplicationModule,
  BessemerGlobalContext,
  BessemerOptions,
  Environments,
} from '@bessemer/framework'
import { Logger, Objects } from '@bessemer/cornerstone'

export const BaseApplicationModule: BessemerApplicationModule<BessemerGlobalContext, BessemerApplicationContext, BessemerOptions> = {
  globalProfile: () => {
    return [Environments.getEnvironmentTag()]
  },
  configure: (options: BessemerOptions): BessemerGlobalContext => {
    Logger.initialize(options.logger)

    return {
      client: {
        environment: Environments.getEnvironment(),
      },
    }
  },
  applicationProfile: async () => {
    return []
  },
  initializeApplication: async (
    _: BessemerOptions,
    global: BessemerGlobalContext,
    runtime: ApplicationRuntimeType<BessemerApplicationContext>
  ): Promise<BessemerApplicationContext> => {
    const application = Objects.merge(global, {
      client: {
        profile: [],
        runtime: runtime,
      },
    })

    return application
  },
}
