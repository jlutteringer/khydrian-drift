import { NominalType } from '@bessemer/cornerstone/types'
import { assert } from '@bessemer/cornerstone/assertion'
import Zod from 'zod'
import {
  IndexSelector,
  InferTypePath,
  NameSelector,
  ParseTypePath,
  TypePathConcreteType,
  TypePathGet,
  TypePathSelector,
  TypePathType,
  WildcardIndexSelector,
  WildcardSelector,
} from '@bessemer/cornerstone/object/type-path-type'
import { isNil, isObject } from '@bessemer/cornerstone/object'
import { isNumber } from '@bessemer/cornerstone/math'
import { only } from '@bessemer/cornerstone/array'

export type TypePath<T extends TypePathType = TypePathType> = NominalType<TypePathConcreteType, ['TypePath', T]>

export const of = <T extends TypePathConcreteType>(value: T): TypePath<InferTypePath<T>> => {
  return value as TypePath<InferTypePath<T>>
}

const TypePathRegex =
  /^(?:[a-zA-Z_$][a-zA-Z0-9_$]*|\*|\d+|\[\s*(?:\*|\d+(?:\s*,\s*\d+)*)\s*])(?:\.(?:[a-zA-Z_$][a-zA-Z0-9_$]*|\*|\d+)|\[\s*(?:\*|\d+(?:\s*,\s*\d+)*)\s*])*$|^$/

export const fromString = <T extends string>(path: T): TypePath<ParseTypePath<T>> => {
  assert(TypePathRegex.test(path), () => `Unable to parse TypePath from string: ${path}`)

  if (path === '') {
    return [] as TypePath<ParseTypePath<T>>
  }

  const segments: Array<string | Array<string | number>> = []
  let current = ''
  let i = 0

  while (i < path.length) {
    const char = path[i]

    if (char === '.') {
      if (current) {
        segments.push(current)
        current = ''
      }
      i++
    } else if (char === '[') {
      if (current) {
        segments.push(current)
        current = ''
      }

      // Find the matching closing bracket
      let bracketContent = ''
      i++ // Skip opening bracket
      let depth = 1

      while (i < path.length && depth > 0) {
        const bracketChar = path[i]
        if (bracketChar === '[') {
          depth++
        } else if (bracketChar === ']') {
          depth--
        }

        if (depth > 0) {
          bracketContent += bracketChar
        }
        i++
      }

      if (bracketContent === '*') {
        segments.push(['*'])
      } else {
        const indices = bracketContent
          .split(',')
          .map((s) => s.trim())
          .map((s) => parseInt(s, 10))

        segments.push(indices)
      }
    } else {
      current += char
      i++
    }
  }

  // Add any remaining current segment
  if (current) {
    segments.push(current)
  }

  return segments as TypePath<ParseTypePath<T>>
}

export const Schema = Zod.union([Zod.array(Zod.string()), Zod.string()]).transform((it) => {
  if (Array.isArray(it)) {
    return of(it)
  } else {
    return fromString(it)
  }
})

export const getValue = <T extends TypePathType, N>(path: TypePath<T>, object: N): TypePathGet<T, N> => {
  let current: unknown = object
  let collectorMode = false

  for (const selector of path) {
    if (isNil(current)) {
      return undefined as TypePathGet<T, N>
    }

    if (collectorMode) {
      if (!Array.isArray(current)) {
        throw new Error('Illegal State - in collectorMode but current value is not an Array')
      }

      const result = current.flatMap((it) => {
        const [value, isCollecting] = evaluateSelector(selector, it)
        if (isCollecting) {
          return value
        } else {
          return [value]
        }
      })

      current = result
    } else {
      const [result, isCollecting] = evaluateSelector(selector, current)
      current = result
      collectorMode = isCollecting
    }
  }

  return current as TypePathGet<T, N>
}

const evaluateSelector = (selector: TypePathSelector, current: unknown): [unknown, boolean] => {
  if (isWildcardSelector(selector)) {
    return evaluateWildcardSelector(current)
  }

  if (Array.isArray(selector)) {
    return evaluateIndexSelector(selector as IndexSelector, current)
  }

  return evaluateNameSelector(selector, current)
}

const evaluateNameSelector = (selector: NameSelector, current: unknown): [unknown, boolean] => {
  if (Array.isArray(current)) {
    const numberSelector = Number(selector)
    // JOHN
    assert(isNumber(Number(selector)), () => `here?`)

    return evaluateIndexSelector([numberSelector], current)
  }

  if (!isObject(current)) {
    return [undefined, false]
  }

  return [current[selector], false]
}

const evaluateWildcardSelector = (current: unknown): [unknown, boolean] => {
  if (Array.isArray(current)) {
    return [current, true]
  }

  if (isObject(current)) {
    throw new Error('Wildcard operations on Objects is not yet supported')
  }

  throw new Error(`Unable to apply wildcard operator to value: ${current}`)
}

const evaluateIndexSelector = (selector: IndexSelector, current: unknown): [unknown, boolean] => {
  if (!Array.isArray(current)) {
    throw new Error(`Unable to apply index operator to value: ${current}`)
  }

  if (selector.length === 1) {
    return [current[only(selector)], false]
  }

  const indexSelector = selector as IndexSelector
  const result = indexSelector.map((it) => current[it])
  return [result, true]
}

export const isWildcardSelector = (selector: TypePathSelector): selector is WildcardSelector | WildcardIndexSelector => {
  if (Array.isArray(selector) && selector.length === 1) {
    return only<string | number>(selector) === '*'
  } else {
    return selector === '*'
  }
}
