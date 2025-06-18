import { Duration } from '@bessemer/cornerstone/duration'
import { Durations } from '@bessemer/cornerstone'

export const execute = <T>(runnable: () => Promise<T>): Promise<T> => {
  return new Promise(async (resolve, reject) => {
    setTimeout(async () => {
      try {
        const value = await runnable()
        resolve(value)
      } catch (e) {
        reject(e)
      }
    }, 0)
  })
}

export const sleep = (duration: Duration): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, Durations.toMilliseconds(duration))
  })
}
