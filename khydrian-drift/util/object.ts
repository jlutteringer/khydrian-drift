import {
  invert as _invert,
  isEqual as _isEqual,
  isNil as _isNil,
  isObject as _isObject,
  isPlainObject as _isPlainObject,
  mapValues as _mapValues,
} from 'lodash-es'

export type ObjectDiffResult = {
  elementsUpdated: Record<string, { originalValue: unknown; updatedValue: unknown }>
  elementsAdded: Record<string, unknown>
  elementsRemoved: Record<string, unknown>
}

export const isNil = _isNil
export const isPresent = <T>(value: T): value is NonNullable<T> => {
  return !isNil(value)
}
export const isObject = _isObject
export const isPlainObject = _isPlainObject
export const deepEqual = _isEqual
export const invert = _invert
export const mapValues = _mapValues

export const isPromise = <T>(element: T | Promise<T>): element is Promise<T> => {
  return typeof (element as Promise<T>).then === 'function'
}

export const parsePath = (path: string): ObjectPath => {
  const pathArray = path.split('.')
  return new ObjectPath(pathArray)
}

export function diffShallow(original: Record<string, unknown>, updated: Record<string, unknown>) {
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

export class ObjectPath {
  constructor(readonly path: Array<string>) {}

  getValue = (object: Record<string, unknown>): unknown | undefined => {
    let root = object

    let nextElement: any = root
    let index = 0
    do {
      const pathPart = this.path[index]
      nextElement = nextElement[pathPart]
      index++
    } while (isObject(nextElement) && index < this.path.length)

    // If we didn't make it to the end, we didn't find the value
    if (index !== this.path.length) {
      return undefined
    }

    return nextElement
  }

  toString = (): string => {
    return this.path.join('.')
  }
}
