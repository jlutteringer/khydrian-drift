import { isNil } from '@bessemer/cornerstone/object'

export type PromiseContext<T> = { promise: Promise<T>; resolve: (value: T) => void; reject: (reason?: any) => void }

export const isPromise = <T>(element: T | Promise<T>): element is Promise<T> => {
  if (isNil(element)) {
    return false
  }

  return typeof (element as Promise<T>).then === 'function'
}

export const toPromise = <T>(element: T | Promise<T>): Promise<T> => {
  if (isPromise(element)) {
    return element
  }

  const { resolve, promise } = create<T>()
  resolve(element)
  return promise
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
