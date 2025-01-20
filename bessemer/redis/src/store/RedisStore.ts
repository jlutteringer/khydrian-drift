import { RemoteKeyValueStore } from '@bessemer/cornerstone/store'
import { Duration } from '@bessemer/cornerstone/duration'
import { RedisApplicationContext } from '@bessemer/redis/application'
import { Redis } from '@bessemer/redis'
import { Arrays, Durations, Eithers, Entries, Objects } from '@bessemer/cornerstone'
import { ResourceKey, ResourceNamespace } from '@bessemer/cornerstone/resource'
import { Entry } from '@bessemer/cornerstone/entry'

export type RedisStoreProps = {
  namespace: ResourceNamespace
  timeToLive: Duration
}

export class RedisStore<T> implements RemoteKeyValueStore<T> {
  constructor(private readonly props: RedisStoreProps, private readonly context: RedisApplicationContext) {}

  namespaceKey = (key: ResourceKey): ResourceKey => {
    const namespace = ResourceKey.extendNamespace(this.context.client.buildId, this.props.namespace)
    return ResourceKey.namespace(namespace, key)
  }

  fetchValues = async (keys: Array<ResourceKey>): Promise<Array<Entry<T>>> => {
    const client = Redis.getClient(this.context)
    const namespacedKeys = keys.map(this.namespaceKey)

    const redisResults = await client.mget(namespacedKeys)
    const results = redisResults
      .map((result, index) => {
        if (Objects.isNil(result)) {
          return null
        }

        const storeEntry = JSON.parse(result) as RedisStoreEntry<T>
        return Entries.of(keys[index]!, storeEntry.value)
      })
      .filter(Objects.isPresent)

    return results
  }

  writeValues = async (entries: Array<Entry<T | undefined>>): Promise<void> => {
    const client = Redis.getClient(this.context)
    const namespacedEntries = Entries.mapKeys(entries, this.namespaceKey)
    const [deletes, writes] = Arrays.bisect(namespacedEntries, (entry) =>
      Objects.isUndefined(entry[1]) ? Eithers.left(entry[0]) : Eithers.right(entry as Entry<T>)
    )

    if (!Arrays.isEmpty(deletes)) {
      await client.del(deletes)
    }

    if (!Arrays.isEmpty(writes)) {
      const storeEntries = Entries.mapValues(writes, (it) => {
        const entry: RedisStoreEntry<T> = {
          value: it,
        }

        return JSON.stringify(entry)
      })

      const commands = storeEntries.map(([key, value]) => {
        return ['set', key, value, 'PX', Durations.inMilliseconds(this.props.timeToLive)]
      })

      await client.multi(commands).exec()
    }
  }
}

type RedisStoreEntry<T> = {
  value: T
}
