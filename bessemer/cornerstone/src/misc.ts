import { Equalitor } from '@bessemer/cornerstone/equalitor'
import { isPresent } from '@bessemer/cornerstone/object'
import { assert } from '@bessemer/cornerstone/assertion'

export const doUntilConsistent = <T>(supplier: (previous: T | null) => T, equals: Equalitor<T>): T => {
  let done = false
  let previousValue: T | null = null
  let attempts = 0
  do {
    assert(attempts < 10)

    const currentValue = supplier(previousValue)

    if (isPresent(previousValue) && equals(previousValue, currentValue)) {
      done = true
    }

    previousValue = currentValue
    attempts++
  } while (!done)

  return previousValue
}
