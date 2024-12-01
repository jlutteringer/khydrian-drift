import { Strings } from '@khydrian-drift/util/index'

export type Reference<T extends string> = {
  id: string
  type: T
  // TODO consider removing... if name changes are made whats in the data store may not match the new values... is this a problem?
  note: string | null
}

export type Referencable<T> = {
  reference: T
}

export const reference = <T extends string>(reference: Reference<T> | string, type: T, note?: string): Reference<typeof type> => {
  if (!Strings.isString(reference)) {
    return reference
  }

  return {
    id: reference,
    type,
    note: note ?? null,
  }
}
