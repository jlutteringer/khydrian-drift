export const take = async function* <T>(iterable: AsyncIterable<T>, count: number) {
  let i = 0

  for await (const item of iterable) {
    if (i++ >= count) {
      break
    }
    yield item
  }
}
