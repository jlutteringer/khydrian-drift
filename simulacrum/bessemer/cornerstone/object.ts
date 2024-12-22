import {
  clone as _clone,
  cloneDeep as _cloneDeep,
  invert as _invert,
  isEqual as _isEqual,
  isNil as _isNil,
  isObject as _isObject,
  isPlainObject as _isPlainObject,
  isUndefined as _isUndefined,
  mapValues as _mapValues,
  merge as unsafeMerge,
  mergeWith as unsafeMergeWith,
} from 'lodash-es'
import { produce } from 'immer'
import { GenericRecord } from '@bessemer/cornerstone/types'
import { Arrays, Maths, Strings } from '@bessemer/cornerstone'
import { Primitive } from 'type-fest'

export const update = produce

export const isUndefined = _isUndefined
export const isNil = _isNil
export const isPresent = <T>(value: T): value is NonNullable<T> => {
  return !isNil(value)
}
export const isObject = _isObject
export const isPlainObject = _isPlainObject
export const deepEqual = _isEqual
export const invert = _invert
export const mapValues = _mapValues

export const clone = _clone
export const cloneDeep = _cloneDeep

export const mergeAll = <T>(objects: Array<T>): T => {
  return objects.reduce((x, y) => merge(x, y))
}

export const merge = <Source1, Source2>(obj1: Source1, obj2: Source2): Source1 & Source2 => {
  return unsafeMerge({}, obj1, obj2)
}

export function mergeInto<Source1, Source2>(source: Source1, values: Source2): asserts source is Source1 & Source2 {
  unsafeMerge(source, values)
}

export const mergeWith: typeof unsafeMergeWith = (...args: Array<any>) => {
  const clone = cloneDeep(args[0])
  return unsafeMergeWith.apply(null, [clone, ...Arrays.rest(args)])
}

export const isPromise = <T>(element: T | Promise<T>): element is Promise<T> => {
  return typeof (element as Promise<T>).then === 'function'
}

export type ObjectDiffResult = {
  elementsUpdated: Record<string, { originalValue: unknown; updatedValue: unknown }>
  elementsAdded: GenericRecord
  elementsRemoved: GenericRecord
}

export function diffShallow(original: GenericRecord, updated: GenericRecord): ObjectDiffResult {
  const result: ObjectDiffResult = {
    elementsUpdated: {},
    elementsAdded: {},
    elementsRemoved: {},
  }

  for (const [key, originalValue] of Object.entries(original)) {
    const updatedValue = updated[key]
    if (updatedValue === undefined) {
      result.elementsRemoved[key] = originalValue
    } else if (!deepEqual(originalValue, updatedValue)) {
      result.elementsUpdated[key] = { originalValue: originalValue, updatedValue: updatedValue }
    }
  }

  for (const [key, updatedValue] of Object.entries(updated)) {
    const originalValue = original[key]
    if (originalValue === undefined) {
      result.elementsAdded[key] = updatedValue
    }
  }
  return result
}

export const isValidKey = (field: PropertyKey, obj: object): field is keyof typeof obj => {
  return field in obj
}

/** Determines if the list of fields are present on the object (not null or undefined), with type inference */
export function fieldsPresent<T extends object, K extends keyof T>(
  object: T,
  fields: Array<K>
): object is Exclude<T, K> & Required<{ [P in K]: NonNullable<T[P]> }> {
  return fields.every((field) => isPresent(object[field]))
}

export type ObjectPath = {
  path: Array<string | number>
}

export const path = (path: Array<string | number>): ObjectPath => {
  return { path }
}

export const parsePath = (path: string): ObjectPath => {
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

  return { path: result }
}

const pathify = (path: ObjectPath | string): ObjectPath => {
  if (Strings.isString(path)) {
    return parsePath(path)
  }

  return path
}

export const getPathValue = (object: GenericRecord, initialPath: ObjectPath | string): unknown | undefined => {
  const path = pathify(initialPath)
  let current: any = object

  for (const key of path.path) {
    if (isPrimitive(current)) {
      return undefined
    }

    current = current[key]
  }

  return current
}

export const applyPathValue = (object: GenericRecord, initialPath: ObjectPath | string, value: unknown): GenericRecord | undefined => {
  const path = pathify(initialPath)

  const newObject = update(object, (draft) => {
    let current: any = draft

    for (let i = 0; i < path.path.length; i++) {
      const key = path.path[i]
      const isLastKey = i === path.path.length - 1

      if (isPrimitive(current)) {
        return
      }

      if (Array.isArray(current)) {
        if (!Maths.isNumber(key)) {
          return
        }

        if (key >= current.length) {
          return
        }
      }

      if (isLastKey) {
        current[key] = value
      } else {
        current = current[key]
      }
    }
  })

  if (newObject === object) {
    return undefined
  }

  return newObject
}

const isPrimitive = (value: any): value is Primitive => {
  return value === null || (typeof value !== 'object' && typeof value !== 'function')
}

type TransformFunction = (value: any, path: (string | number)[], key: string | number, parent: any) => any

const walk = (value: any, transform: TransformFunction, path: (string | number)[] = []): any => {
  if (isNil(value) || isPrimitive(value)) {
    return value
  }

  if (Array.isArray(value)) {
    return value.map((value, index) => {
      const currentPath = [...path, index]
      return walk(transform(value, currentPath, index, value), transform, currentPath)
    })
  }

  const result: any = {}
  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      const currentPath = [...path, key]
      const transformedValue = transform(value[key], currentPath, key, value)
      result[key] = walk(transformedValue, transform, currentPath)
    }
  }

  return result
}