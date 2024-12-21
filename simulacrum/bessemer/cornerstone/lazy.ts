import { Functions } from '@bessemer/cornerstone'

export type LazyValue<T> = T | (() => T)

export const evaluate = <T>(value: LazyValue<T>): T => {
  if (Functions.isFunction(value)) {
    return value()
  } else {
    return value
  }
}
