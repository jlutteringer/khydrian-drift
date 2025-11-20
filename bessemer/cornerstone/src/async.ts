import { Duration, toMilliseconds } from '@bessemer/cornerstone/temporal/duration'
import { executeAsync } from '@bessemer/cornerstone/internal'

export const execute = executeAsync

export const sleep = (duration: Duration): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, toMilliseconds(duration))
  })
}
