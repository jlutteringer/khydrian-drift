import {
  ApplicationRuntimeType,
  BessemerApplicationContext,
  BessemerApplicationModule,
  BessemerOptions,
  Caches,
  Environments,
} from '@bessemer/framework'
import { Loggers } from '@bessemer/cornerstone'
import { LocalAdvisoryLockProvider } from '@bessemer/framework/advisory-lock/LocalAdvisoryLockProvider'

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
    options: BessemerOptions,
    runtime: ApplicationRuntimeType<BessemerApplicationContext>
  ): Promise<BessemerApplicationContext> => {
    const application: BessemerApplicationContext = {
      cache: Caches.configure(options.cache),
      advisoryLockProvider: new LocalAdvisoryLockProvider(),
      client: {
        // JOHN we need to actually set these of course
        buildId: '1234',
        instanceId: '5678',
        correlationId: 'asdf',
        environment: Environments.getEnvironment(),
        tags: [],
        runtime: runtime,
      },
    }

    return application
  },
}
