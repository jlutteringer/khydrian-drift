import {
  clone as _clone,
  cloneDeep as _cloneDeep,
  invert as _invert,
  isEqual as _isEqual,
  isNil as _isNil,
  isNumber,
  isObject as _isObject,
  isPlainObject as _isPlainObject,
  isString,
  isUndefined as _isUndefined,
  mapValues as _mapValues,
  merge as unsafeMerge,
  mergeWith as unsafeMergeWith,
} from 'lodash-es'
import { produce } from 'immer'
import { NominalType } from '@bessemer/cornerstone/types'
import { Primitive, UnknownRecord } from 'type-fest'

export const update: typeof produce = produce

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

export function merge<TObject, TSource>(object: TObject, source: TSource): TObject & TSource
export function merge<TObject, TSource1, TSource2>(object: TObject, source1: TSource1, source2: TSource2): TObject & TSource1 & TSource2
export function merge<TObject, TSource1, TSource2, TSource3>(
  object: TObject,
  source1: TSource1,
  source2: TSource2,
  source3: TSource3
): TObject & TSource1 & TSource2 & TSource3
export function merge<TObject, TSource1, TSource2, TSource3, TSource4>(
  object: TObject,
  source1: TSource1,
  source2: TSource2,
  source3: TSource3,
  source4: TSource4
): TObject & TSource1 & TSource2 & TSource3 & TSource4
export function merge(object: any, ...otherArgs: any[]): any {
  return unsafeMerge({}, object, ...otherArgs)
}

export function mergeInto<Source1, Source2>(source: Source1, values: Source2): asserts source is Source1 & Source2 {
  unsafeMerge(source, values)
}

export const mergeWith: typeof unsafeMergeWith = (...args: Array<any>) => {
  const clone = cloneDeep(args[0])
  return unsafeMergeWith.apply(null, [clone, ...args.slice(1)])
}

export type ObjectDiffResult = {
  elementsUpdated: Record<string, { originalValue: unknown; updatedValue: unknown }>
  elementsAdded: UnknownRecord
  elementsRemoved: UnknownRecord
}

export function diffShallow(original: UnknownRecord, updated: UnknownRecord): ObjectDiffResult {
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
  if (isString(path)) {
    return parsePath(path)
  }

  return path as ObjectPath
}

export const getPathValue = (object: UnknownRecord, initialPath: ObjectPath | string): unknown | undefined => {
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

export const applyPathValue = (object: UnknownRecord, initialPath: ObjectPath | string, value: unknown): UnknownRecord | undefined => {
  const path = pathify(initialPath)

  const newObject = update(object, (draft) => {
    let current: any = draft

    for (let i = 0; i < path.path.length; i++) {
      const key = path.path[i]!
      const isLastKey = i === path.path.length - 1

      if (isPrimitive(current)) {
        return
      }

      if (Array.isArray(current)) {
        if (!isNumber(key)) {
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

export type RecordAttribute<Type = unknown, Class extends string = 'RecordAttribute'> = NominalType<string, [Type, Class]>
type RecordAttributeType<Attribute> = Attribute extends RecordAttribute<infer Type, string> ? Type : never

export const getAttribute = <T extends RecordAttribute<unknown, string>>(record: UnknownRecord, attribute: T): RecordAttributeType<T> | undefined => {
  return record[attribute] as RecordAttributeType<T> | undefined
}
