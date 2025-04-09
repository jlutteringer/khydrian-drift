import { Dates, Objects, References } from '@bessemer/cornerstone'
import { Reference } from '@bessemer/cornerstone/reference'
import { BasicType } from '@bessemer/cornerstone/types'

// JOHN it is probably worth revisiting this in the context of using this library code more frequently... in particular
// all of these things have similar properties ("primitives", sortable, value equality, etc.) but this method of implementation
// forces them all to be converted to strings or numbers first which is an expensive operation.
export type Signable = BasicType | { id: string } | { reference: Reference<string> }

export const sign = (value: Signable): string | number => {
  if (Objects.isObject(value)) {
    if(Dates.isDate(value)) {
      return value.getTime()
    }
    else if (References.isReferencable(value)) {
      return value.reference.id
    } else {
      return value.id
    }
  }

  if(value === true) {
    return 1
  }
  if(value === false) {
    return 0
  }

  return value
}

export const signAll = (values: Array<Signable>): Array<string | number> => {
  return values.map(sign)
}
