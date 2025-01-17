import { ApplicationRuntimeType, BessemerApplicationContext, BessemerApplicationModule, BessemerOptions } from '@bessemer/framework'
import { BaseApplicationModule } from '@bessemer/framework/application'
import { RedisAdvisoryLockProvider } from '@bessemer/redis/advisory-lock/RedisAdvisoryLockProvider'
import { Objects } from '@bessemer/cornerstone'

export type RedisOptions = BessemerOptions & {
  redis?: {
    connectionUrl: string
  }
}

export type RedisApplicationContext = BessemerApplicationContext & {
  redis?: {
    connectionUrl: string
  }
}

export const RedisApplicationModule: BessemerApplicationModule<RedisApplicationContext, RedisOptions> = {
  globalTags: BaseApplicationModule.globalTags,
  configure: BaseApplicationModule.configure,
  applicationTags: BaseApplicationModule.applicationTags,
  initializeApplication: async (
    options: RedisOptions,
    runtime: ApplicationRuntimeType<RedisApplicationContext>
  ): Promise<RedisApplicationContext> => {
    const baseApplication = await BaseApplicationModule.initializeApplication(options, runtime)
    if (Objects.isPresent(options.redis)) {
      baseApplication.advisoryLockProvider = new RedisAdvisoryLockProvider()
    }
    return baseApplication
  },
}
