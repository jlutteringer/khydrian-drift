import Zod, { ZodType } from 'zod/v4'

export type Entry<Key, Value> = [Key, Value]
export type RecordEntry<Value> = Entry<string, Value>

export const schema = <Key, Value>(key: ZodType<Key>, value: ZodType<Value>): ZodType<Entry<Key, Value>> => {
  return Zod.tuple([key ?? Zod.string(), value]) as ZodType<Entry<Key, Value>>
}

export const recordSchema = <Value>(value: ZodType<Value>): ZodType<RecordEntry<Value>> => {
  return schema(Zod.string(), value)
}

export const of = <Key, Value>(key: Key, value: Value): Entry<Key, Value> => {
  return [key, value]
}

export const keys = <Key>(entries: Array<Entry<Key, unknown>>): Array<Key> => {
  return entries.map((it) => it[0])
}

export const values = <T>(entries: Array<Entry<unknown, T>>): Array<T> => {
  return entries.map((it) => it[1])
}

export const mapKeys = <Key, Value, NewKey>(entries: Array<Entry<Key, Value>>, mapper: (key: Key) => NewKey): Array<Entry<NewKey, Value>> => {
  return entries.map(([key, value]) => of(mapper(key), value))
}

export const mapValues = <Key, Value, NewValue>(entries: Array<Entry<Key, Value>>, mapper: (key: Value) => NewValue): Array<Entry<Key, NewValue>> => {
  return entries.map(([key, value]) => of(key, mapper(value)))
}
