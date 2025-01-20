import { ResourceKey } from '@bessemer/cornerstone/resource'
import { Entry } from '@bessemer/cornerstone/entry'

export interface LocalStore<T> {
  setValue: (value: T | undefined) => void
  getValue: () => T | undefined
}

export interface LocalKeyValueStore<T> {
  setValues: (entries: Array<Entry<T | undefined>>) => void
  getValues: (keys: Array<ResourceKey>) => Array<Entry<T>>
}

export interface RemoteStore<T> {
  writeValue: (value: T | undefined) => Promise<void>
  fetchValue: () => Promise<T | undefined>
}

export interface RemoteKeyValueStore<T> {
  writeValues: (entries: Array<Entry<T | undefined>>) => Promise<void>
  fetchValues: (keys: Array<ResourceKey>) => Promise<Array<Entry<T>>>
}

export abstract class AbstractLocalKeyValueStore<T> implements LocalKeyValueStore<T>, RemoteKeyValueStore<T> {
  abstract getValues: (keys: Array<ResourceKey>) => Array<Entry<T>>
  abstract setValues: (entries: Array<Entry<T | undefined>>) => void

  async fetchValues(keys: Array<ResourceKey>): Promise<Array<Entry<T>>> {
    return this.getValues(keys)
  }

  async writeValues(entries: Array<Entry<T | undefined>>): Promise<void> {
    this.setValues(entries)
  }
}
