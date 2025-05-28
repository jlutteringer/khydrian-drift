import { AbstractRemoteKeyValueStore } from '@bessemer/cornerstone/store'
import { RedisApplicationContext } from '@bessemer/redis/application'
import { Redis } from '@bessemer/redis'
import { Arrays, Durations, Eithers, Entries, Objects, Strings } from '@bessemer/cornerstone'
import { ResourceKey } from '@bessemer/cornerstone/resource'
import { Entry } from '@bessemer/cornerstone/entry'
import { GlobalContextType } from '@bessemer/framework'
import { Duration } from '@bessemer/cornerstone/duration'
import { GlobPattern } from '@bessemer/cornerstone/glob'
import { Arrayable } from 'type-fest'

export type RedisKeyValueStoreProps = {
  namespace: ResourceKey
  timeToLive: Duration
}

export class RedisKeyValueStore<T> extends AbstractRemoteKeyValueStore<T> {
  constructor(private readonly props: RedisKeyValueStoreProps, private readonly context: GlobalContextType<RedisApplicationContext>) {
    super()
  }

  private namespaceKey = (key: ResourceKey): ResourceKey => {
    const namespace = ResourceKey.extendNamespace(this.context.global.buildId, this.props.namespace)
    return ResourceKey.namespace(namespace, key)
  }

  fetchValues = async (keys: Array<ResourceKey>): Promise<Array<Entry<T>>> => {
    const client = Redis.getClient(this.context.global.redis)
    const namespacedKeys = keys.map(this.namespaceKey)

    const redisResults = await client.mget(namespacedKeys)
    const results = redisResults
      .map((result, index) => {
        if (Objects.isNil(result)) {
          return null
        }

        const storeEntry = JSON.parse(result) as RedisKeyValueStoreEntry<T>
        return Entries.of(keys[index]!, storeEntry.value)
      })
      .filter(Objects.isPresent)

    return results
  }

  writeValues = async (entries: Array<Entry<T | undefined>>): Promise<void> => {
    const client = Redis.getClient(this.context.global.redis)
    const namespacedEntries = Entries.mapKeys(entries, this.namespaceKey)
    const [deletes, writes] = Arrays.bisect(namespacedEntries, (entry) =>
      Objects.isUndefined(entry[1]) ? Eithers.left(entry[0]) : Eithers.right(entry as Entry<T>)
    )

    if (!Arrays.isEmpty(deletes)) {
      await client.del(deletes)
    }

    if (!Arrays.isEmpty(writes)) {
      const storeEntries = Entries.mapValues(writes, (it) => {
        const entry: RedisKeyValueStoreEntry<T> = {
          value: it,
        }

        return JSON.stringify(entry)
      })

      const commands = storeEntries.map(([key, value]) => {
        if (Objects.isNil(this.props.timeToLive)) {
          return ['set', key, value]
        } else {
          return ['set', key, value, 'PX', Durations.toMilliseconds(this.props.timeToLive)]
        }
      })

      await client.multi(commands).exec()
    }
  }

  evictAll = async (patterns: Arrayable<GlobPattern>): Promise<void> => {
    const client = Redis.getClient(this.context.global.redis)

    const results = Arrays.toArray(patterns).map((pattern) => {
      const keyPattern = Strings.replace(this.namespaceKey(pattern), "'", "\\'")
      return client.eval(`for _,k in ipairs(redis.call('keys','${keyPattern}')) do redis.call('del',k) end`, 0)
    })

    await Promise.all(results)
  }
}

type RedisKeyValueStoreEntry<T> = {
  value: T
}
