import { Duration } from '@bessemer/cornerstone/duration'
import { DeepPartial } from '@bessemer/cornerstone/types'
import { Async, Durations, Maths, Objects, Preconditions, Results } from '@bessemer/cornerstone/index'
import { AsyncResult, Result } from '@bessemer/cornerstone/result'

export type RetryProps = {
  attempts: number
  delay: Duration
}

export type RetryOptions = DeepPartial<RetryProps>

export const None: RetryProps = {
  attempts: 0,
  delay: Durations.Zero,
}

export const DefaultRetryProps: RetryProps = {
  attempts: 3,
  delay: Durations.ofMilliseconds(500),
}

export type RetryState = {
  attempt: number
  props: RetryProps
}

export const initialize = (initialOptions?: RetryOptions): RetryState => {
  const props = Objects.merge(DefaultRetryProps, initialOptions)
  Preconditions.isTrue(props.attempts > 0, () => 'usingRetry attempts must be > 0')

  return {
    attempt: 0,
    props,
  }
}

export const retry = async (state: RetryState): Promise<RetryState | undefined> => {
  if (state.attempt >= state.props.attempts - 1) {
    return undefined
  }

  const delayMs = Durations.inMilliseconds(state.props.delay)
  const maxJitterMs = delayMs * 0.3 // We calculate max jitter as 30% of the delay
  await Async.sleep(Durations.ofMilliseconds(delayMs + Maths.random(0, maxJitterMs)))

  return {
    props: state.props,
    attempt: state.attempt++,
  }
}

export const usingRetry = async <T>(runnable: () => Promise<Result<T>>, initialOptions?: RetryOptions): AsyncResult<T> => {
  let retryState: RetryState | undefined = initialize(initialOptions)
  let previousResult: Result<T> = Results.failure()

  do {
    const result = await Results.tryResult(runnable)
    previousResult = result

    if (result.isSuccess) {
      return result
    }

    retryState = await retry(retryState)
  } while (!Objects.isUndefined(retryState))

  return previousResult
}
