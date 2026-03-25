export const map = async function* <T, U>(iterable: AsyncIterable<T>, mapper: (item: T) => U | Promise<U>): AsyncIterable<U> {
  for await (const item of iterable) {
    yield await mapper(item)
  }
}

export const take = async function* <T>(iterable: AsyncIterable<T>, count: number): AsyncIterable<T> {
  yield* takeWhile(iterable, (_, index) => index < count)
}

export const takeWhile = async function* <T>(
  iterable: AsyncIterable<T>,
  predicate: (item: T, index: number) => boolean | Promise<boolean>
): AsyncIterable<T> {
  let i = 0

  for await (const item of iterable) {
    if (!(await predicate(item, i++))) {
      break
    }

    yield item
  }
}
