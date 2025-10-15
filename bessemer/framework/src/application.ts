import { BessemerApplicationContext, BessemerModule, BessemerOptions, Caches, Environments } from '@bessemer/framework'
import { Loggers, Ulids } from '@bessemer/cornerstone'
import { LocalAdvisoryLockProvider } from '@bessemer/framework/advisory-lock/LocalAdvisoryLockProvider'
import { DEPRECATEDDeepPartial } from '@bessemer/cornerstone/types'

export const BaseApplicationModule: BessemerModule<BessemerApplicationContext, BessemerOptions> = {
  global: {
    tags: (tags) => {
      return [...tags, Environments.getEnvironmentTag()]
    },
    configure: (options) => {
      return {
        global: {
          cache: Caches.configure(options.cache),
          instanceId: Ulids.generate(),
          advisoryLockProvider: new LocalAdvisoryLockProvider(),
        },
      }
    },
    initialize: (options, context) => {
      Loggers.initialize(options.logger)

      context.global.cache.manager.initialize(context)
    },
  },
  configure: async (options) => {
    const application: DEPRECATEDDeepPartial<BessemerApplicationContext> = {
      client: {
        correlationId: 'asdf',
        environment: Environments.getEnvironment(),
      },
    }

    return application
  },
}
