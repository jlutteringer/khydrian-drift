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
  WildcardSelector,
} from '@bessemer/cornerstone/object/type-path-type'
import { isNil, isObject } from '@bessemer/cornerstone/object'
import { isNumber } from '@bessemer/cornerstone/math'
import { contains, containsAll, isEmpty, only } from '@bessemer/cornerstone/array'
import { failure, Result, success } from '@bessemer/cornerstone/result'

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
        segments.push('*')
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
    assert(isNumber(numberSelector), () => `Can't apply non-numeric selector: ${selector} to array: ${current}`)
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

export const isWildcardSelector = (selector: TypePathSelector): selector is WildcardSelector => {
  return selector === '*'
}

export const matches = <MatchingPath extends TypePathType>(
  targetPath: TypePath,
  matchingPath: TypePath<MatchingPath>
): targetPath is TypePath<MatchingPath> => {
  if (targetPath.length < matchingPath.length) {
    return false
  }

  let index = 0
  for (const targetPathSelector of targetPath) {
    const matchingPathSelector = matchingPath[index]

    if (isNil(matchingPathSelector)) {
      return true
    } else if (isWildcardSelector(matchingPathSelector)) {
      // Matching path wildcards always match - they're wild
    } else if (isWildcardSelector(targetPathSelector)) {
      return false
    } else if (Array.isArray(matchingPathSelector)) {
      if (Array.isArray(targetPathSelector)) {
        if (!containsAll(matchingPathSelector, targetPathSelector)) {
          return false
        }
      } else {
        if (!contains(matchingPathSelector, Number(targetPathSelector))) {
          return false
        }
      }
    } else {
      if (Array.isArray(targetPathSelector)) {
        if (targetPathSelector.length !== 1) {
          return false
        }

        const targetPathSelectorIndex = only(targetPathSelector)
        if (targetPathSelectorIndex !== Number(matchingPathSelector)) {
          return false
        }
      } else {
        if (targetPathSelector !== matchingPathSelector) {
          return false
        }
      }
    }

    index++
  }

  return true
}

export const intersectAny = (targetPath: TypePath, intersectingPath: TypePath): Result<TypePath> => {
  if (targetPath.length < intersectingPath.length) {
    return failure(new Error(`TypePath: ${intersectingPath} can't intersect target TypePath: ${targetPath}`))
  }

  let index = 0
  let result: TypePathConcreteType = []
  for (const targetPathSelector of targetPath) {
    const intersectingPathSelector = intersectingPath[index]
    const makeError = () =>
      new Error(`Path mismatch when intersecting. targetPath: ${targetPathSelector} does not match intersectingPath: ${intersectingPathSelector}`)

    if (isNil(intersectingPathSelector)) {
      return success(of(result))
    } else if (isWildcardSelector(intersectingPathSelector)) {
      result.push(targetPathSelector)
    } else if (isWildcardSelector(targetPathSelector)) {
      return failure(makeError())
    } else if (Array.isArray(intersectingPathSelector)) {
      if (Array.isArray(targetPathSelector)) {
        const filteredTargetPaths = targetPathSelector.filter((it) => contains(intersectingPathSelector, it))
        if (isEmpty(filteredTargetPaths)) {
          return failure(makeError())
        }

        result.push(filteredTargetPaths)
      } else {
        if (!contains(intersectingPathSelector, Number(targetPathSelector))) {
          return failure(makeError())
        }

        result.push(targetPathSelector)
      }
    } else {
      if (Array.isArray(targetPathSelector)) {
        if (targetPathSelector.length !== 1) {
          return failure(makeError())
        }

        const targetPathSelectorIndex = only(targetPathSelector)
        if (targetPathSelectorIndex !== Number(intersectingPathSelector)) {
          return failure(makeError())
        }

        result.push(targetPathSelector)
      } else {
        if (targetPathSelector !== intersectingPathSelector) {
          return failure(makeError())
        }

        result.push(targetPathSelector)
      }
    }

    index++
  }

  return success(of(result))
}

// JOHN this needs to do a type resolution step...
export const intersect = <TargetPath extends TypePathType, IntersectingPath extends TypePathType>(
  targetPath: TypePath<TargetPath>,
  intersectingPath: TypePath<IntersectingPath>
): TypePath => {
  const result = intersectAny(targetPath, intersectingPath)
  if (!result.isSuccess) {
    throw result.value
  }

  return result.value
}
