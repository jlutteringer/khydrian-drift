import Zod from 'zod'
import { Get, Paths, UnknownRecord } from 'type-fest'
import { isObject } from '@bessemer/cornerstone/object'
import { produce } from 'immer'
import { assert } from '@bessemer/cornerstone/assertion'
import { isEmpty } from '@bessemer/cornerstone/array'
import { failure, Result, success } from '@bessemer/cornerstone/result'
import { JoinPath, NominalType, ToString, ToStringArray } from '@bessemer/cornerstone/types'

export type ObjectPathType = string
export type ObjectPath<T extends ObjectPathType = ObjectPathType> = NominalType<Array<string>, ['ObjectPath', T]>
export type ConstrainObjectPaths<N> = ObjectPath<ToString<Paths<N>>>

export const of = <T extends Array<string | number>>(value: T): ObjectPath<JoinPath<ToStringArray<T>>> => {
  return value.map((it) => `${it}`) as ObjectPath<JoinPath<ToStringArray<T>>>
}

const ObjectPathRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*|\.\d+)*$/

export const fromString = <T extends ObjectPathType>(path: T): ObjectPath<T> => {
  assert(ObjectPathRegex.test(path), () => `Unable to parse ObjectPath from string: ${path}`)
  return of(path.split('.')) as ObjectPath<T>
}

export const Schema = Zod.union([Zod.array(Zod.union([Zod.string(), Zod.number()])), Zod.string()]).transform((it) => {
  if (Array.isArray(it)) {
    return of(it)
  } else {
    return fromString(it)
  }
})

export const getValue = <N extends UnknownRecord, T extends ObjectPathType>(object: N, path: ObjectPath<T>): Get<N, T> => {
  const result = getValueResult(object, path)

  if (result.isSuccess) {
    return result.value
  } else {
    throw new Error(`Unable to resolve ObjectPath: ${path} against record: ${JSON.stringify(object)}`)
  }
}

export const findValue = <N extends UnknownRecord, T extends ObjectPathType>(object: N, path: ObjectPath<T>): Get<N, T> | undefined => {
  const result = getValueResult(object, path)

  if (result.isSuccess) {
    return result.value
  } else {
    return undefined
  }
}

export const applyValue = (object: UnknownRecord, path: ObjectPath, valueToApply: unknown): unknown => {
  if (isEmpty(path)) {
    return valueToApply
  }

  return produce(object, (draft) => {
    const rest = path.slice(0, -1)
    const last = path[path.length - 1]!
    const parent: any = isEmpty(rest) ? draft : getValue(draft, of(rest))

    // Check to make sure the last index is ok
    assertLegalIndex(parent, last, object, path)
    parent[last] = valueToApply
  })
}

const getValueResult = (object: UnknownRecord, path: ObjectPath): Result<any> => {
  let value: any = object

  for (const key of path) {
    if (Array.isArray(value)) {
      const numberKey = Number(key)
      if (numberKey < 0 || numberKey >= value.length) {
        return failure()
      }

      value = value[numberKey]
    } else if (isObject(value)) {
      if (!(key in value)) {
        return failure()
      }

      value = value[key]
    } else {
      return failure()
    }
  }

  return success(value)
}

const assertLegalIndex = (value: any, _key: string, object: UnknownRecord, path: ObjectPath): void => {
  if (Array.isArray(value) || isObject(value)) {
    return
  } else {
    throw new Error(`Unable to resolve ObjectPath: ${path} against record: ${JSON.stringify(object)}`)
  }
}
