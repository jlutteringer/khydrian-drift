import { Assertions, Objects } from '@bessemer/cornerstone'
import { Equalitor } from '@bessemer/cornerstone/equalitor'

export const doUntilConsistent = <T>(supplier: (previous: T | null) => T, equals: Equalitor<T>): T => {
  let done = false
  let previousValue: T | null = null
  let attempts = 0
  do {
    Assertions.assertTrue(attempts < 10)

    const currentValue = supplier(previousValue)

    if (Objects.isPresent(previousValue) && equals(previousValue, currentValue)) {
      done = true
    }

    previousValue = currentValue
    attempts++
  } while (!done)

  return previousValue
}
