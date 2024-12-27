export const isServer = (): boolean => {
  return typeof window === 'undefined'
}

export const isClient = (): boolean => {
  return !isServer()
}