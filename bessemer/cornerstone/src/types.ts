import { Instant } from '@bessemer/cornerstone/temporal/instant'

export function cast<T>(value: unknown): asserts value is T {}

declare const __type: unique symbol

export type NominalTyping<NominalType> = { [__type]: NominalType }

export type NominalType<ConcreteType, NominalType> = ConcreteType & NominalTyping<NominalType>

export type TaggedTyping<NominalType> = { [__type]?: NominalType }

export type TaggedType<ConcreteType, NominalType> = ConcreteType & TaggedTyping<NominalType>

export type Alias<T> = TaggedType<T, any>

export type Throwable = unknown

export type Dictionary<T> = Record<string, T>

export type Nil = null | undefined

export type DEPRECATEDDeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U> ? DEPRECATEDDeepPartial<U>[] : T[P] extends object | undefined ? DEPRECATEDDeepPartial<T[P]> : T[P]
}

// JOHN maybe this needs a different definition...
export type BasicType = string | number | boolean | Date | Instant

export type ToString<T> = T extends string | number ? `${T}` : never

export type ToStringArray<T extends Array<string | number>> = {
  [K in keyof T]: T[K] extends string | number ? `${T[K]}` : never
}

export type JoinPath<T extends readonly string[]> = T extends readonly [infer First, ...infer Rest]
  ? First extends string
    ? Rest extends readonly string[]
      ? Rest['length'] extends 0
        ? First
        : `${First}.${JoinPath<Rest>}`
      : never
    : never
  : ''

/**
 * filter an array type by a predicate value
 * @param T - array type
 * @param C - predicate object to match
 * @details - this is using tail recursion type optimization from typescript 4.5
 */
export type FilterArrayByValue<T extends unknown[] | undefined, C, Acc extends unknown[] = []> = T extends [infer Head, ...infer Tail]
  ? Head extends C
    ? FilterArrayByValue<Tail, C, [...Acc, Head]>
    : FilterArrayByValue<Tail, C, Acc>
  : Acc

/**
 * filter an array type by key
 * @param T - array type
 * @param K - key to match
 * @details - this is using tail recursion type optimization from typescript 4.5
 */
export type FilterArrayByKey<T extends unknown[], K extends string, Acc extends unknown[] = []> = T extends [infer Head, ...infer Tail]
  ? Head extends { [Key in K]: unknown }
    ? FilterArrayByKey<Tail, K, [...Acc, Head]>
    : FilterArrayByKey<Tail, K, Acc>
  : Acc

/**
 * filter an array type by removing undefined values
 * @param T - array type
 * @details - this is using tail recursion type optimization from typescript 4.5
 */
export type DefinedArray<T extends unknown[], Acc extends unknown[] = []> = T extends [infer Head, ...infer Tail]
  ? Head extends undefined
    ? DefinedArray<Tail, Acc>
    : DefinedArray<Tail, [Head, ...Acc]>
  : Acc
