import { TaggedType } from '@bessemer/cornerstone/types'
import Zod, { ZodType } from 'zod'
import { UnknownRecord } from 'type-fest'
import { isObject } from '@bessemer/cornerstone/object'
import { produce } from 'immer'
import { isNumber } from '@bessemer/cornerstone/math'
import { isEmpty, isString } from '@bessemer/cornerstone/string'
import { assert } from '@bessemer/cornerstone/assertion'

export type ObjectPath = TaggedType<string, 'ObjectPath'>
export const Schema: ZodType<ObjectPath> = Zod.string().regex(
  /^[a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*|\[\d+])*$/,
  'Invalid ObjectPath format'
) as any

export const of = (value: string): ObjectPath => {
  assert(!isEmpty(value))
  return value as ObjectPath
}

export const fromString = (value: string): ObjectPath => {
  return Schema.parse(value)
}

export const getValue = (object: UnknownRecord, path: ObjectPath): unknown => {
  const parsedPath = parse(path)
  return getValueInternal(object, parsedPath)
}

export const applyValue = (object: UnknownRecord, path: ObjectPath, valueToApply: unknown): unknown => {
  return produce(object, (draft) => {
    const parsedPath = parse(path)
    const rest = parsedPath.slice(0, -1)
    const last = parsedPath[parsedPath.length - 1]!

    const parent: any = getValueInternal(draft, rest)

    // Check to make sure the last index is ok
    assertLegalIndex(parent, last, object, parsedPath)
    parent[last] = valueToApply
  })
}

const parse = (path: ObjectPath): Array<string | number> => {
  const result: Array<string | number> = []
  const regex = /([^.\[\]]+)|\[(\d+)]/g

  let match: RegExpExecArray | null
  while ((match = regex.exec(path)) !== null) {
    if (match[1] !== undefined) {
      result.push(match[1])
    } else if (match[2] !== undefined) {
      result.push(Number(match[2]))
    }
  }

  return result
}

const getValueInternal = (object: UnknownRecord, parsedPath: Array<string | number>): unknown => {
  let value: any = object
  for (const key of parsedPath) {
    value = getIndexValueOrThrow(value, key, object, parsedPath)
  }

  return value
}

const getIndexValueOrThrow = (value: any, key: string | number, object: UnknownRecord, parsedPath: Array<string | number>): any => {
  if (isNumber(key) && Array.isArray(value)) {
    if (key < 0 || key >= value.length) {
      throw new Error(`Unable to resolve ObjectPath: ${parsedPath} against record: ${JSON.stringify(object)}`)
    }

    return value[key]
  } else if (isString(key) && isObject(value)) {
    if (!(key in value)) {
      throw new Error(`Unable to resolve ObjectPath: ${parsedPath} against record: ${JSON.stringify(object)}`)
    }

    return value[key]
  } else {
    throw new Error(`Unable to resolve ObjectPath: ${parsedPath} against record: ${JSON.stringify(object)}`)
  }
}

const assertLegalIndex = (value: any, key: string | number, object: UnknownRecord, parsedPath: Array<string | number>): void => {
  if (isNumber(key) && Array.isArray(value)) {
    return
  } else if (isString(key) && isObject(value)) {
    return
  } else {
    throw new Error(`Unable to resolve ObjectPath: ${parsedPath} against record: ${JSON.stringify(object)}`)
  }
}
