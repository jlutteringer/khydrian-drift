import Zod, { ZodType } from 'zod'
import { Objects } from '@bessemer/cornerstone/index'

export type PendingValue = {
  isSuccess: false
  isError: false
  isLoading: false
  isFetching: boolean
  data: undefined
}

export type LoadingValue = {
  isSuccess: false
  isError: false
  isLoading: true
  isFetching: boolean
  data: undefined
}

export type ErrorValue = {
  isSuccess: false
  isError: true
  isLoading: false
  isFetching: boolean
  data: unknown
}

export type FetchingValueSuccess<T> = {
  isSuccess: true
  isError: false
  isLoading: false
  isFetching: true
  data: T
}

export type FetchingValueError = {
  isSuccess: false
  isError: true
  isLoading: false
  isFetching: true
  data: unknown
}

export type SettledValue<T> = {
  isSuccess: true
  isError: false
  isLoading: false
  isFetching: false
  data: T
}

export type AsyncValue<T> = PendingValue | LoadingValue | ErrorValue | FetchingValueSuccess<T> | FetchingValueError | SettledValue<T>

export const schema = <T>(_: ZodType<T>): ZodType<AsyncValue<T>> => {
  return Zod.object({
    isSuccess: Zod.boolean(),
    isError: Zod.boolean(),
    isLoading: Zod.boolean(),
    isFetching: Zod.boolean(),
    data: Zod.unknown(),
  }) as any
}

export const isSettled = <T>(value: AsyncValue<T>): value is SettledValue<T> => {
  return value.isSuccess && !value.isError && !value.isLoading && !value.isFetching
}

export const loading = (): LoadingValue => ({ isSuccess: false, isError: false, isLoading: true, isFetching: true, data: undefined })

export const fetching = <T>(data: T): FetchingValueSuccess<T> => ({
  isSuccess: true,
  isError: false,
  isLoading: false,
  isFetching: true,
  data,
})

export const settled = <T>(data: T): SettledValue<T> => ({ isSuccess: true, isError: false, isLoading: false, isFetching: false, data })

export const error = (error: unknown): ErrorValue => ({ isSuccess: false, isError: true, isLoading: false, isFetching: false, data: error })

export const handle = <T, N>(
  value: AsyncValue<T | null>,
  handlers: { loading: () => N; error: (error: unknown) => N; absent: () => N; success: (data: T) => N }
): N => {
  if (value.isLoading || (value.isError && value.isFetching)) {
    return handlers.loading()
  }
  if (value.isError) {
    return handlers.error(value.data)
  }
  if (Objects.isNil(value.data)) {
    return handlers.absent()
  }

  return handlers.success(value.data)
}

export const map = <T, N>(value: AsyncValue<T>, mapper: (value: T) => N): AsyncValue<N> => {
  if (!value.isSuccess) {
    return value
  }

  return { ...value, data: mapper(value.data) }
}
