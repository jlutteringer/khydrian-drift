import { NominalType } from '@bessemer/cornerstone/types'
import { Assertions, Objects, Tags } from '@bessemer/cornerstone'
import { Tag, TagType } from '@bessemer/cornerstone/tag'

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

  Assertions.assertUnreachable(() => 'Environments.getEnvironment - unable to resolve environment. (Checking APP_ENV and NODE_ENV)')
}

const EnvironmentTag: TagType<Environment> = 'Environment'

export const getEnvironmentTag = (): Tag => {
  return Tags.tag(EnvironmentTag, getEnvironment())
}
