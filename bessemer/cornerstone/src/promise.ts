export type PromiseContext<T> = { promise: Promise<T>; resolve: (value: T) => void; reject: (reason?: any) => void }

export const isPromise = <T>(element: T | Promise<T>): element is Promise<T> => {
  return typeof (element as Promise<T>).then === 'function'
}

export const create = <T>(): PromiseContext<T> => {
  let resolveVar
  let rejectVar
  const promise = new Promise<T>((resolve, reject) => {
    resolveVar = resolve
    rejectVar = reject
  })

  return { promise, resolve: resolveVar!, reject: rejectVar! }
}
