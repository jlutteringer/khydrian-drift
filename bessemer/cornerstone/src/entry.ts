export type Entry<Value, Key = string> = [Key, Value]

export const of = <Value, Key = string>(key: Key, value: Value): Entry<Value, Key> => {
  return [key, value]
}

export const keys = <Key>(entries: Array<Entry<unknown, Key>>): Array<Key> => {
  return entries.map((it) => it[0])
}

export const values = <T>(entries: Array<Entry<T>>): Array<T> => {
  return entries.map((it) => it[1])
}

export const mapKeys = <Value, Key, NewKey>(entries: Array<Entry<Value, Key>>, mapper: (key: Key) => NewKey): Array<Entry<Value, NewKey>> => {
  return entries.map(([key, value]) => of(mapper(key), value))
}

export const mapValues = <Value, Key, NewValue>(entries: Array<Entry<Value, Key>>, mapper: (key: Value) => NewValue): Array<Entry<NewValue, Key>> => {
  return entries.map(([key, value]) => of(key, mapper(value)))
}
