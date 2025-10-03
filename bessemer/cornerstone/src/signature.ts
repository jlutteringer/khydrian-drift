import { isReferencable, Reference } from '@bessemer/cornerstone/reference'
import { BasicType } from '@bessemer/cornerstone/types'
import { isObject } from '@bessemer/cornerstone/object'
import { isDate } from '@bessemer/cornerstone/temporal/date'
import { _isInstant, _toLiteral } from '@bessemer/cornerstone/temporal/chrono'

// JOHN it is probably worth revisiting this in the context of using this library code more frequently... in particular
// all of these things have similar properties ("primitives", sortable, value equality, etc.) but this method of implementation
// forces them all to be converted to strings or numbers first which is an expensive operation.

export type Signable = BasicType | null | { id: string } | { reference: Reference<string> }
export type Signature = string | number | null

export const sign = (value: Signable): Signature => {
  if (value === null) {
    return null
  }

  if (isObject(value)) {
    if (isReferencable(value)) {
      return value.reference.id
    } else {
      return value.id
    }
  }

  if (isDate(value)) {
    return value.getTime()
  }

  if (_isInstant(value)) {
    return _toLiteral(value)
  }

  if (value === true) {
    return 1
  }
  if (value === false) {
    return 0
  }

  return value
}

export const signAll = (values: Array<Signable>): Array<Signature> => {
  return values.map(sign)
}
