export const executeAsync = <T>(runnable: () => Promise<T>): Promise<T> => {
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
