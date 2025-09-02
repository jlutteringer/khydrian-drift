import { $brand } from 'zod'

export interface NominalTyping<NominalTypingT> {
  _type?: NominalTypingT
}

export type NominalType<T, NominalTypingT> = T & NominalTyping<NominalTypingT>

export type Alias<T> = NominalType<T, any>

export type TaggedTyping<TaggedTypingT extends string | number | symbol> = {
  [$brand]: {
    [k in TaggedTypingT]: true
  }
}

export type TaggedType<T, TaggedTypingT extends string | number | symbol> = T & TaggedTyping<TaggedTypingT>

export type Throwable = unknown

export type Dictionary<T> = Record<string, T>

export type Nil = null | undefined

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U> ? DeepPartial<U>[] : T[P] extends object | undefined ? DeepPartial<T[P]> : T[P]
}

export type BasicType = string | number | boolean | Date

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
