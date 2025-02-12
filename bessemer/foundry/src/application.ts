import { CoreApplicationContext, CoreApplicationModule, CoreClientContext, CoreOptions } from '@bessemer/core/application'
import { BessemerModule } from '@bessemer/framework'

export type FoundryOptions = CoreOptions

export type FoundryApplicationContext = CoreApplicationContext

export type FoundryClientContext = CoreClientContext

export const FoundryApplicationModule: BessemerModule<FoundryApplicationContext, FoundryOptions> = {
  dependencies: [CoreApplicationModule],
}
