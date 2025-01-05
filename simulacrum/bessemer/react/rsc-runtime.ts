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

export const isServer = () => {
  return getRuntime() === RscRuntime.Server
}

export const isSsr = () => {
  return getRuntime() === RscRuntime.Ssr
}

export const isClient = () => {
  return getRuntime() === RscRuntime.Client
}
