interface NominalTyping<NominalTypingT> {
  _type?: NominalTypingT
}

export type NominalType<T, NominalTypingT> = T & NominalTyping<NominalTypingT>

export type Primitive = string | number | boolean | symbol | bigint | null | undefined
export type Dictionary<T> = Record<string, T>
export type GenericRecord = Dictionary<unknown>

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U> ? DeepPartial<U>[] : T[P] extends object | undefined ? DeepPartial<T[P]> : T[P]
}

export type Nil = null | undefined
