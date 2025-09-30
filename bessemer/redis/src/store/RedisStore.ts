import { RemoteStore } from '@bessemer/cornerstone/store'
import { GlobalContextType } from '@bessemer/framework'
import { RedisApplicationContext } from '@bessemer/redis/application'
import { ResourceKey } from '@bessemer/cornerstone/resource-key'
import { Duration } from '@bessemer/cornerstone/time/duration'
import { Redis } from '@bessemer/redis'
import { Durations, Objects } from '@bessemer/cornerstone'

export type RedisStoreProps = {
  key: ResourceKey
  timeToLive: Duration
}

export class RedisStore<T> implements RemoteStore<T> {
  constructor(private readonly props: RedisStoreProps, private readonly context: GlobalContextType<RedisApplicationContext>) {}

  fetchValue = async (): Promise<T | undefined> => {
    const client = Redis.getClient(this.context.global.redis)
    const redisResult = await client.get(this.props.key)
    if (Objects.isNil(redisResult)) {
      return undefined
    }

    const result = JSON.parse(redisResult) as RedisStoreEntry<T>
    return result.value
  }

  writeValue = async (value: T | undefined): Promise<void> => {
    const client = Redis.getClient(this.context.global.redis)

    if (Objects.isUndefined(value)) {
      await client.del(this.props.key)
    } else {
      const entry: RedisStoreEntry<T> = {
        value,
      }

      const entryString = JSON.stringify(entry)

      if (Objects.isNil(this.props.timeToLive)) {
        await client.set(this.props.key, entryString)
      } else {
        await client.set(this.props.key, entryString, 'PX', Durations.toMilliseconds(this.props.timeToLive))
      }
    }
  }
}

type RedisStoreEntry<T> = {
  value: T
}
