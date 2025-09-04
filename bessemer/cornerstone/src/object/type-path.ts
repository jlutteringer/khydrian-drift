import { NominalType } from '@bessemer/cornerstone/types'
import { assert } from '@bessemer/cornerstone/assertion'
import Zod from 'zod'
import { InferTypePath, ParseTypePath, TypePathConcreteType, TypePathGet, TypePathType } from '@bessemer/cornerstone/object/type-path-type'
import { isNil } from '@bessemer/cornerstone/object'

export type TypePath<T extends TypePathType = TypePathType> = NominalType<TypePathConcreteType, ['TypePath', T]>

export const of = <T extends TypePathConcreteType>(value: T): TypePath<InferTypePath<T>> => {
  return value as TypePath<InferTypePath<T>>
}

const TypePathRegex =
  /^(?:[a-zA-Z_$][a-zA-Z0-9_$]*|\*|\d+|\[(?:\*|\d+(?:,\s*\d+)*)])(?:\.(?:[a-zA-Z_$][a-zA-Z0-9_$]*|\*|\d+)|\[(?:\*|\d+(?:,\s*\d+)*)])*$|^$/

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

export const getValue = <T extends TypePathType, N>(object: N, path: TypePath<T>): TypePathGet<T, N> => {
  let current: unknown = object

  for (const selector of path) {
    if (isNil(current)) {
      return current as TypePathGet<T, N>
    }

    if (Array.isArray(selector)) {
      // Handle bracket selectors like [1], [*], [1, 2, 3]
      if (selector.length === 1) {
        const single = selector[0]
        if (single === '*') {
          // [*] - wildcard array access, pass array through
          if (!Array.isArray(current)) {
            return undefined as TypePathGet<T, N>
          }
        } else if (typeof single === 'number') {
          // [1] - single index
          if (!Array.isArray(current)) {
            return undefined as TypePathGet<T, N>
          }
          current = current[single]
        }
      } else {
        // [1, 2, 3] - multiple indices
        if (!Array.isArray(current)) {
          return undefined as TypePathGet<T, N>
        }
        current = selector.map((index: any) => (typeof index === 'number' ? current[index] : undefined))
      }
    } else if (selector === '*') {
      // Wildcard selector
      if (Array.isArray(current)) {
        // For arrays, wildcard maps over elements (handled by next selector)
        // Keep current as-is for now
      } else if (typeof current === 'object' && current !== null) {
        current = Object.values(current)
      } else {
        return undefined as TypePathGet<T, N>
      }
    } else if (typeof selector === 'string') {
      // Property name selector
      if (Array.isArray(current)) {
        // Map property access over array elements
        current = current.map((item) => (item && typeof item === 'object' ? item[selector] : undefined))
      } else if (typeof current === 'object' && current !== null) {
        current = current[selector]
      } else {
        return undefined as TypePathGet<T, N>
      }
    }
  }

  return current as TypePathGet<T, N>
}
