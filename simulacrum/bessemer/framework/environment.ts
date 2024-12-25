import { NominalType } from '@bessemer/cornerstone/types'
import { Objects, Preconditions } from '@bessemer/cornerstone'
import { PropertyTag, PropertyTagType } from '@bessemer/cornerstone/property'

export type Environment = NominalType<string, 'Environment'>

export const getEnvironment = (): Environment => {
  const appEnv = process.env.APP_ENV
  if (Objects.isPresent(appEnv)) {
    return appEnv
  }

  const nodeEnv = process.env.NODE_ENV
  if (Objects.isPresent(nodeEnv)) {
    return nodeEnv
  }

  Preconditions.isUnreachable('Environments.getEnvironment - unable to resolve environment. (Checking APP_ENV and NODE_ENV)')
}

const EnvironmentProperty: PropertyTagType = 'Environment'

export const getEnvironmentTag = (): PropertyTag => {
  return {
    type: EnvironmentProperty,
    value: getEnvironment(),
  }
}
