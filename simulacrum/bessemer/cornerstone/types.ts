interface NominalTyping<NominalTypingT> {
  _type?: NominalTypingT
}

export type NominalType<T, NominalTypingT> = T & NominalTyping<NominalTypingT>

export type Primitive = string | number | boolean | symbol | bigint | null | undefined
export type GenericRecord = Record<string, unknown>
