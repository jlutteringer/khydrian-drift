import { use } from 'react'
import { AsyncValue } from '@bessemer/cornerstone/async-value'
import { AsyncValues } from '@bessemer/cornerstone'

export const useAsync = <T>(runnable: () => Promise<T>): AsyncValue<T> => {
  return use(
    (async () => {
      try {
        const result = await runnable()
        return AsyncValues.settled(result)
      } catch (e) {
        return AsyncValues.error(e)
      }
    })()
  )
}
