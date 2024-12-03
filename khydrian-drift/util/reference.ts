import { Comparators, Equalitors, Objects, Strings } from '@khydrian-drift/util/index'
import { Comparator } from '@khydrian-drift/util/comparator'

export type Reference<T extends string> = {
  id: string
  type: T
  // TODO consider removing... if name changes are made whats in the data store may not match the new values... is this a problem?
  note: string | null
}

export type Referencable<T> = {
  reference: T
}

export const reference = <T extends string>(reference: string | Reference<T>, type: T, note?: string): Reference<typeof type> => {
  if (!Strings.isString(reference)) {
    return reference
  }

  return {
    id: reference,
    type,
    note: note ?? null,
  }
}

export const isReferencable = (element: unknown): element is Referencable<unknown> => {
  if (!Objects.isObject(element)) {
    return false
  }

  const referencable = element as Referencable<unknown>
  return !Objects.isUndefined(referencable.reference)
}

export const isReference = (element: unknown): element is Reference<string> => {
  if (!Objects.isObject(element)) {
    return false
  }

  const referencable = element as Reference<string>
  return !Objects.isUndefined(referencable.id) && !Objects.isUndefined(referencable.type) && !Objects.isUndefined(referencable.note)
}

export const getReference = <T extends string, N extends Reference<T>>(reference: N | Referencable<N>): N => {
  const referencable = reference as Referencable<N>
  if (Objects.isPresent(referencable.reference)) {
    return referencable.reference
  } else {
    return reference as N
  }
}

export const equals = <T extends string>(first: Reference<T>, second: Reference<T>): boolean => {
  return first.id === second.id
}

export const comparator = <T extends string>(): Comparator<Reference<T>> => {
  return Comparators.compareBy((it) => it.id, Comparators.natural())
}

export const equalitor = () => Equalitors.fromComparator(comparator())
