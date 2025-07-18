import { Equalitor } from '@bessemer/cornerstone/equalitor'
import { assertTrue } from '@bessemer/cornerstone/assertion'
import { isPresent } from '@bessemer/cornerstone/object'

export const doUntilConsistent = <T>(supplier: (previous: T | null) => T, equals: Equalitor<T>): T => {
  let done = false
  let previousValue: T | null = null
  let attempts = 0
  do {
    assertTrue(attempts < 10)

    const currentValue = supplier(previousValue)

    if (isPresent(previousValue) && equals(previousValue, currentValue)) {
      done = true
    }

    previousValue = currentValue
    attempts++
  } while (!done)

  return previousValue
}
