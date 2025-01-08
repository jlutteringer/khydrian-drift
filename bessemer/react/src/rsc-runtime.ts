import { rsc } from 'rsc-env'

export enum RscRuntime {
  Server = 'Server',
  Ssr = 'Ssr',
  Client = 'Client',
}

export const getRuntime = (): RscRuntime => {
  if (rsc) {
    return RscRuntime.Server
  } else if (typeof window === 'undefined') {
    return RscRuntime.Ssr
  } else {
    return RscRuntime.Client
  }
}

// This is constant to enable tree shaking server code out of the client bundle
export const isServer = rsc

export const isSsr = () => {
  return getRuntime() === RscRuntime.Ssr
}

export const isClient = () => {
  return getRuntime() === RscRuntime.Client
}
