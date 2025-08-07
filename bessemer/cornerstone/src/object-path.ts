import { TaggedType } from '@bessemer/cornerstone/types'
import Zod, { ZodType } from 'zod'
import { UnknownRecord } from 'type-fest'
import { isObject } from '@bessemer/cornerstone/object'
import { produce } from 'immer'
import { isNumber } from '@bessemer/cornerstone/math'
import { isString } from '@bessemer/cornerstone/string'
import { assert } from '@bessemer/cornerstone/assertion'
import { isEmpty } from '@bessemer/cornerstone/array'

export type ObjectPath = TaggedType<Array<string | number>, 'ObjectPath'>
export const Schema: ZodType<ObjectPath> = Zod.array(Zod.union([Zod.string(), Zod.number()])) as any

export const of = (value: Array<string | number>): ObjectPath => {
  return value as ObjectPath
}

const ObjectPathRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*|\[\d+])*$/
const ObjectPathPartRegex = /([^.\[\]]+)|\[(\d+)]/g

export const fromString = (path: string): ObjectPath => {
  assert(ObjectPathRegex.test(path), () => `Unable to parse ObjectPath from string: ${path}`)

  const result: Array<string | number> = []

  let match: RegExpExecArray | null
  while ((match = ObjectPathPartRegex.exec(path)) !== null) {
    if (match[1] !== undefined) {
      result.push(match[1])
    } else if (match[2] !== undefined) {
      result.push(Number(match[2]))
    }
  }

  return of(result)
}

export const getValue = (object: UnknownRecord, path: ObjectPath): unknown => {
  let value: any = object
  for (const key of path) {
    value = getIndexValueOrThrow(value, key, object, path)
  }

  return value
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

const getIndexValueOrThrow = (value: any, key: string | number, object: UnknownRecord, path: ObjectPath): any => {
  if (isNumber(key) && Array.isArray(value)) {
    if (key < 0 || key >= value.length) {
      throw new Error(`Unable to resolve ObjectPath: ${path} against record: ${JSON.stringify(object)}`)
    }

    return value[key]
  } else if (isString(key) && isObject(value)) {
    if (!(key in value)) {
      throw new Error(`Unable to resolve ObjectPath: ${path} against record: ${JSON.stringify(object)}`)
    }

    return value[key]
  } else {
    throw new Error(`Unable to resolve ObjectPath: ${path} against record: ${JSON.stringify(object)}`)
  }
}

const assertLegalIndex = (value: any, key: string | number, object: UnknownRecord, path: ObjectPath): void => {
  if (isNumber(key) && Array.isArray(value)) {
    return
  } else if (isString(key) && isObject(value)) {
    return
  } else {
    throw new Error(`Unable to resolve ObjectPath: ${path} against record: ${JSON.stringify(object)}`)
  }
}
