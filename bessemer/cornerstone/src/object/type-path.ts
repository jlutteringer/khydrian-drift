import { NominalType } from '@bessemer/cornerstone/types'
import { assert } from '@bessemer/cornerstone/assertion'
import Zod from 'zod'
import { InferTypePath, ParseTypePath, TypePathConcreteType, TypePathType } from '@bessemer/cornerstone/object/type-path-type'

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
