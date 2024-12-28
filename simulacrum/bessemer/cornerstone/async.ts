import { Duration } from '@bessemer/cornerstone/duration'
import { Durations } from '@bessemer/cornerstone/index'

export const sleep = (duration: Duration): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, Durations.inMilliseconds(duration))
  })
}

export const execute = <T>(runnable: () => Promise<T>): Promise<T> => {
  return (async () => {
    return await runnable()
  })()
}
