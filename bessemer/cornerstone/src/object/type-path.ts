import { JoinPath, NominalType, ToStringArray } from '@bessemer/cornerstone/types'
import { assert } from '@bessemer/cornerstone/assertion'
import Zod from 'zod'

// see https://github.com/sinclairnick/jsonpath-ts for type inference examples!

export type TypePathType = string
export type TypePath<T extends TypePathType = TypePathType> = NominalType<Array<string>, ['TypePath', T]>

export const of = <T extends Array<string | number>>(value: T): TypePath<JoinPath<ToStringArray<T>>> => {
  return value.map((it) => `${it}`) as TypePath<JoinPath<ToStringArray<T>>>
}

const TypePathRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*|\[\d+]|\[\*])*$/

export const fromString = <T extends TypePathType>(path: T): TypePath<T> => {
  assert(TypePathRegex.test(path), () => `Unable to parse ObjectPath from string: ${path}`)
  return of(path.split('.')) as TypePath<T>
}

export const Schema = Zod.union([Zod.array(Zod.string()), Zod.string()]).transform((it) => {
  if (Array.isArray(it)) {
    return of(it)
  } else {
    return fromString(it)
  }
})

export const matches = (evaluatingPath: TypePath, targetPath: TypePath): boolean => {
  if (targetPath.length !== evaluatingPath.length) {
    return false
  }

  for (let i = 0; i < targetPath.length; i++) {
    const evaluatingSegment = evaluatingPath[i]
    const targetSegment = targetPath[i]

    if (evaluatingSegment === '*') {
      continue
    }

    if (targetSegment === '*') {
      return false
    }

    if (targetSegment !== evaluatingSegment) {
      return false
    }
  }

  return true
}
