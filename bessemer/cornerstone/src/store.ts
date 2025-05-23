import { ResourceKey } from '@bessemer/cornerstone/resource'
import { Entry } from '@bessemer/cornerstone/entry'
import { Arrays, Entries, Objects } from '@bessemer/cornerstone'

export interface LocalStore<T> {
  setValue: (value: T | undefined) => void
  getValue: () => T | undefined
}

export interface LocalKeyValueStore<T> {
  setValues: (entries: Array<Entry<T | undefined>>) => void
  setValue: (key: ResourceKey, value: T | undefined) => void

  getEntries: () => Array<Entry<T>>
  getValues: (keys: Array<ResourceKey>) => Array<Entry<T>>
  getValue: (key: ResourceKey) => T | undefined
}

export interface RemoteStore<T> {
  writeValue: (value: T | undefined) => Promise<void>
  fetchValue: () => Promise<T | undefined>
}

export interface RemoteKeyValueStore<T> {
  writeValues: (entries: Array<Entry<T | undefined>>) => Promise<void>
  writeValue: (key: ResourceKey, value: T | undefined) => Promise<void>

  fetchValues: (keys: Array<ResourceKey>) => Promise<Array<Entry<T>>>
  fetchValue: (key: ResourceKey) => Promise<T | undefined>
}

export abstract class AbstractRemoteKeyValueStore<T> implements RemoteKeyValueStore<T> {
  abstract writeValues: (entries: Array<Entry<T | undefined>>) => Promise<void>

  writeValue = async (key: ResourceKey, value: T | undefined): Promise<void> => {
    await this.writeValues([Entries.of(key, value)])
  }

  abstract fetchValues: (keys: Array<ResourceKey>) => Promise<Array<Entry<T>>>

  fetchValue = async (key: ResourceKey): Promise<T | undefined> => {
    return Arrays.first(await this.fetchValues([key]))?.[1]
  }
}

export abstract class AbstractLocalKeyValueStore<T> extends AbstractRemoteKeyValueStore<T> implements LocalKeyValueStore<T> {
  abstract setValues: (entries: Array<Entry<T | undefined>>) => void

  setValue = (key: ResourceKey, value: T | undefined): void => {
    this.setValues([Entries.of(key, value)])
  }

  abstract getEntries: () => Array<Entry<T>>
  abstract getValues: (keys: Array<ResourceKey>) => Array<Entry<T>>

  getValue = (key: ResourceKey): T | undefined => {
    return Arrays.first(this.getValues([key]))?.[1]
  }

  fetchValues = async (keys: Array<ResourceKey>): Promise<Array<Entry<T>>> => {
    return this.getValues(keys)
  }

  writeValues = async (entries: Array<Entry<T | undefined>>): Promise<void> => {
    this.setValues(entries)
  }
}

export const fromMap = <T>(): LocalKeyValueStore<T> => {
  const map = new Map<string, T>()

  return new (class extends AbstractLocalKeyValueStore<T> {
    override getEntries = (): Array<Entry<T>> => {
      return Array.from(map.entries())
    }

    override setValues = (entries: Entry<T | undefined>[]): void => {
      entries.forEach(([key, value]) => {
        if (Objects.isNil(value)) {
          map.delete(key)
        } else {
          map.set(key, value)
        }
      })
    }

    override getValues = (keys: Array<ResourceKey>): Array<Entry<T>> => {
      return keys.map((key) => Entries.of(key, map.get(key)!)).filter((it) => Objects.isPresent(it[1]))
    }
  })()
}
