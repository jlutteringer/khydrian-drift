import { ResourceKey } from '@bessemer/cornerstone/resource'

export interface LocalStore<T> {
  setValue: (value: T | undefined) => void
  getValue: () => T | undefined
}

export interface LocalKeyValueStore<T> {
  setValue: (key: ResourceKey, value: T | undefined) => void
  getValue: (key: ResourceKey) => T | undefined
}

export interface RemoteStore<T> {
  writeValue: (value: T | undefined) => Promise<void>
  fetchValue: () => Promise<T | undefined>
}

export interface RemoteKeyValueStore<T> {
  writeValue: (key: ResourceKey, value: T | undefined) => Promise<void>
  fetchValue: (key: ResourceKey) => Promise<T | undefined>
}

export abstract class AbstractLocalKeyValueStore<T> implements LocalKeyValueStore<T>, RemoteKeyValueStore<T> {
  abstract setValue: (key: ResourceKey, value: T | undefined) => void
  abstract getValue: (key: ResourceKey) => T | undefined

  async writeValue(key: ResourceKey, value: T | undefined): Promise<void> {
    this.setValue(key, value)
  }

  async fetchValue(key: ResourceKey): Promise<T | undefined> {
    return this.getValue(key)
  }
}
