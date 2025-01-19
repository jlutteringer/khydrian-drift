import { RemoteKeyValueStore } from '@bessemer/cornerstone/store'
import { ResourceKey } from '@bessemer/cornerstone/resource'
import { Duration } from '@bessemer/cornerstone/duration'
import { RedisApplicationContext } from '@bessemer/redis/application'
import { Redis } from '@bessemer/redis'
import { Durations, Objects } from '@bessemer/cornerstone'

export type RedisStoreProps = {
  namespace: ResourceKey
  timeToLive: Duration
}

export class RedisStore<T> implements RemoteKeyValueStore<T> {
  constructor(private readonly props: RedisStoreProps, private readonly context: RedisApplicationContext) {}

  getKeyString = (key: ResourceKey): ResourceKey => {
    return ResourceKey.namespace(key, ResourceKey.of([this.context.client.buildId, this.props.namespace]))
  }

  fetchValue = async (key: ResourceKey): Promise<T | undefined> => {
    const client = Redis.getClient(this.context)
    const keyString = this.getKeyString(key)

    const result = await client.get(keyString)
    if (Objects.isNil(result)) {
      return undefined
    }

    const payload = JSON.parse(result) as RedisStoreEntry<T>
    return payload.value
  }

  writeValue = async (key: ResourceKey, newEntry: T | undefined): Promise<void> => {
    const client = Redis.getClient(this.context)
    const keyString = this.getKeyString(key)

    if (newEntry === undefined) {
      await client.del(keyString)
      return
    }

    const entry = {
      value: newEntry,
    }

    const rawValue = JSON.stringify(entry)
    await client.set(keyString, rawValue, 'PX', Durations.inMilliseconds(this.props.timeToLive))
  }
}

type RedisStoreEntry<T> = {
  value: T
}
