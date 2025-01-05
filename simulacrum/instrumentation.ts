import { Bessemer } from '@bessemer/framework'
import { ApplicationModule } from '@simulacrum/common/application'
import { ApplicationRuntimeModule } from '@simulacrum/common/application/common'
import { ApplicationProperties } from '@simulacrum/common/application/properties'

export const register = () => {
  if (process.env.NEXT_RUNTIME !== 'edge') {
    Bessemer.configure({
      applicationProvider: ApplicationModule,
      runtimeProvider: ApplicationRuntimeModule,
      properties: ApplicationProperties,
    })
  }
}
