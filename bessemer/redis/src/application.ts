import { BessemerApplicationContext, BessemerModule, BessemerOptions, GlobalContextType } from '@bessemer/framework'
import { RedisAdvisoryLockProvider } from '@bessemer/redis/advisory-lock/RedisAdvisoryLockProvider'
import { Objects } from '@bessemer/cornerstone'
import { BaseApplicationModule } from '@bessemer/framework/application'
import { DeepPartial } from '@bessemer/cornerstone/types'
import { RedisCacheManager } from '@bessemer/redis/cache/RedisCacheManager'
import { RedisCacheProvider } from '@bessemer/redis/cache/RedisCacheProvider'

export type RedisClientContext = {
  connectionUrl: string
}

export type RedisOptions = BessemerOptions & {
  redis?: RedisClientContext
}

export type RedisApplicationContext = BessemerApplicationContext & {
  global: {
    redis?: RedisClientContext
  }
}

export const RedisApplicationModule: BessemerModule<RedisApplicationContext, RedisOptions> = {
  global: {
    configure: (options: RedisOptions, context) => {
      if (Objects.isNil(options.redis)) {
        return {}
      }

      const redisApplication: DeepPartial<GlobalContextType<RedisApplicationContext>> = {
        global: {
          redis: options.redis,
          advisoryLockProvider: new RedisAdvisoryLockProvider(),
          cache: {
            manager: new RedisCacheManager(),
            providers: [...(context.global?.cache?.providers ?? []), RedisCacheProvider.register()],
            configuration: {
              defaults: {
                providers: [...(context.global?.cache?.configuration?.defaults?.providers ?? []), { type: RedisCacheProvider.Type, maxSize: null }],
              },
            },
          },
        },
      }

      return redisApplication
    },
  },
  dependencies: [BaseApplicationModule],
}
