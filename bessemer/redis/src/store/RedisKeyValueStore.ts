import { AbstractRemoteKeyValueStore } from '@bessemer/cornerstone/store'
import { Arrays, Durations, Eithers, Entries, Objects, ResourceKeys, Strings } from '@bessemer/cornerstone'
import { ResourceKey, ResourceNamespace } from '@bessemer/cornerstone/resource-key'
import { RecordEntry } from '@bessemer/cornerstone/entry'
import { Duration } from '@bessemer/cornerstone/temporal/duration'
import { GlobPattern } from '@bessemer/cornerstone/glob'
import { Arrayable } from 'type-fest'
import { RedisClient } from '@bessemer/redis/redis'

export type RedisKeyValueStoreProps = {
  namespace: ResourceNamespace
  timeToLive: Duration
}

export class RedisKeyValueStore<T> extends AbstractRemoteKeyValueStore<T> {
  constructor(private readonly client: RedisClient, private readonly props: RedisKeyValueStoreProps) {
    super()
  }

  private namespaceKey = (key: ResourceKey): ResourceKey => {
    return ResourceKeys.applyNamespace(key, this.props.namespace)
  }

  fetchValues = async (keys: Array<ResourceKey>): Promise<Array<RecordEntry<T>>> => {
    const namespacedKeys = keys.map(this.namespaceKey)

    const redisResults = await this.client.mget(namespacedKeys)
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

  writeValues = async (entries: Array<RecordEntry<T | undefined>>): Promise<void> => {
    const namespacedEntries = Entries.mapKeys(entries, this.namespaceKey)
    const [deletes, writes] = Arrays.bisect(namespacedEntries, (entry) =>
      Objects.isUndefined(entry[1]) ? Eithers.left(entry[0]) : Eithers.right(entry as RecordEntry<T>)
    )

    if (!Arrays.isEmpty(deletes)) {
      await this.client.del(deletes)
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

      await this.client.multi(commands).exec()
    }
  }

  evictAll = async (patterns: Arrayable<GlobPattern>): Promise<void> => {
    const results = Arrays.toArray(patterns).map((pattern) => {
      const keyPattern = Strings.replace(this.namespaceKey(pattern), "'", "\\'")
      return this.client.eval(`for _,k in ipairs(redis.call('keys','${keyPattern}')) do redis.call('del',k) end`, 0)
    })

    await Promise.all(results)
  }
}

type RedisKeyValueStoreEntry<T> = {
  value: T
}
