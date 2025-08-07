export type LazyValue<T> = () => T

export const evaluate = <T>(value: LazyValue<T>): T => {
  return value()
}
