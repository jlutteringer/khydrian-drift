import { BessemerApplicationModule } from '@bessemer/framework'
import { CoreApplicationContext, CoreApplicationModule, CoreClientContext, CoreOptions } from '@bessemer/core/application'

export type FoundryOptions = CoreOptions

export type FoundryApplicationContext = CoreApplicationContext

export type FoundryClientContext = CoreClientContext

export const FoundryApplicationModule: BessemerApplicationModule<FoundryApplicationContext, FoundryOptions> = {
  globalTags: CoreApplicationModule.globalTags,
  configure: CoreApplicationModule.configure,
  applicationTags: CoreApplicationModule.applicationTags,
  initializeApplication: CoreApplicationModule.initializeApplication,
}
