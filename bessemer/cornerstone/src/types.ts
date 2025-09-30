declare const __type: unique symbol

export type NominalType<ConcreteType, NominalType> = ConcreteType & { [__type]: NominalType }

export type TaggedType<ConcreteType, NominalType> = ConcreteType & { [__type]?: NominalType }

export type Alias<T> = TaggedType<T, any>

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
