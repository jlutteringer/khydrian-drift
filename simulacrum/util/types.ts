interface NominalTyping<NominalTypingT> {
  _type?: NominalTypingT
}

export type NominalType<T, NominalTypingT> = T & NominalTyping<NominalTypingT>

export type GenericRecord = Record<string, unknown>
