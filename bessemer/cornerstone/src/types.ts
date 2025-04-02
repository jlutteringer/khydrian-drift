export interface NominalTyping<NominalTypingT> {
  _type?: NominalTypingT
}

export type NominalType<T, NominalTypingT> = T & NominalTyping<NominalTypingT>

interface TaggedTyping<TaggedTypingT> {
  _type: TaggedTypingT
}

export type TaggedType<T, TaggedTypingT> = T & TaggedTyping<TaggedTypingT>

export type Throwable = unknown

export type Dictionary<T> = Record<string, T>

export type Nil = null | undefined

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U> ? DeepPartial<U>[] : T[P] extends object | undefined ? DeepPartial<T[P]> : T[P]
}
