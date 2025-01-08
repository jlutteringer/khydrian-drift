import { Async } from '@bessemer/cornerstone'
import { AsyncValue } from '@bessemer/cornerstone/async'
import { use } from 'react'

export const useAsync = <T>(runnable: () => Promise<T>): AsyncValue<T> => {
  return use(
    (async () => {
      try {
        const result = await runnable()
        return Async.settled(result)
      } catch (e) {
        return Async.error(e)
      }
    })()
  )
}
