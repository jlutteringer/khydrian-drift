import { Objects, References } from '@bessemer/cornerstone'
import { Reference } from '@bessemer/cornerstone/reference'

export type Signable = number | string | { id: string } | { reference: Reference<string> }

export const sign = (value: Signable): string | number => {
  if (Objects.isObject(value)) {
    if (References.isReferencable(value)) {
      return value.reference.id
    } else {
      return value.id
    }
  }

  return value
}

export const signAll = (values: Array<Signable>): Array<string | number> => {
  return values.map(sign)
}
