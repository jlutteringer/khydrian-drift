import { Duration, fromMilliseconds, toMilliseconds, Zero } from '@bessemer/cornerstone/time/duration'
import { AsyncResult, failure, Result } from '@bessemer/cornerstone/result'
import { PartialDeep } from 'type-fest'
import { deepMerge, isUndefined } from '@bessemer/cornerstone/object'
import { sleep } from '@bessemer/cornerstone/async'
import { random } from '@bessemer/cornerstone/math'
import { assert } from '@bessemer/cornerstone/assertion'

export type RetryProps = {
  attempts: number
  delay: Duration
}

export type RetryOptions = PartialDeep<RetryProps>

export const None: RetryProps = {
  attempts: 0,
  delay: Zero,
}

export const DefaultRetryProps: RetryProps = {
  attempts: 3,
  delay: fromMilliseconds(500),
}

export type RetryState = {
  attempt: number
  props: RetryProps
}

export const initialize = (initialOptions?: RetryOptions): RetryState => {
  const props = deepMerge(DefaultRetryProps, initialOptions)
  assert(props.attempts >= 0, () => 'usingRetry attempts must be >= 0')

  return {
    attempt: 0,
    props,
  }
}

export const retry = async (state: RetryState): Promise<RetryState | undefined> => {
  if (state.attempt >= state.props.attempts - 1) {
    return undefined
  }

  const delayMs = toMilliseconds(state.props.delay)
  const maxJitterMs = delayMs * 0.3 // We calculate max jitter as 30% of the delay
  await sleep(fromMilliseconds(delayMs + random(0, maxJitterMs)))

  return {
    props: state.props,
    attempt: state.attempt + 1,
  }
}

export const usingRetry = async <T>(runnable: () => Promise<Result<T>>, initialOptions?: RetryOptions): AsyncResult<T> => {
  let retryState: RetryState | undefined = initialize(initialOptions)
  let previousResult: Result<T> = failure()

  do {
    // JOHN Should this be a try/catch? it was causing debugging problems
    const result = await runnable()
    previousResult = result

    if (result.isSuccess) {
      return result
    }

    retryState = await retry(retryState)
  } while (!isUndefined(retryState))

  return previousResult
}
