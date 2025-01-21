import { ApplicationRuntimeType, BessemerApplicationContext, BessemerApplicationModule, BessemerOptions } from '@bessemer/framework'
import { BaseApplicationModule } from '@bessemer/framework/application'
import { RedisAdvisoryLockProvider } from '@bessemer/redis/advisory-lock/RedisAdvisoryLockProvider'
import { Objects } from '@bessemer/cornerstone'
import { RedisCacheProvider } from '@bessemer/redis/cache/RedisCacheProvider'

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

    if (Objects.isNil(options.redis)) {
      return baseApplication
    }

    const redisApplication: RedisApplicationContext = Objects.merge(baseApplication, {
      redis: options.redis,
      advisoryLockProvider: new RedisAdvisoryLockProvider(),
      cache: {
        providers: [...baseApplication.cache.providers, RedisCacheProvider.register()],
        configuration: {
          defaults: {
            providers: [...baseApplication.cache.configuration.defaults.providers, { type: RedisCacheProvider.Type, maxSize: null }],
          },
        },
      },
    })

    return redisApplication
  },
}
