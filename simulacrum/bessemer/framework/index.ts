import * as Bessemer from './bessemer'
import * as Environments from './environment'
import { Environment } from './environment'
import { GenericRecord } from '@bessemer/cornerstone/types'
import { PropertyTag } from '@bessemer/cornerstone/property'

export { Bessemer, Environments }

export interface FrameworkApplicationOptions extends GenericRecord {}

export interface FrameworkApplicationContext {
  environment: Environment
}

export interface FrameworkBrowseContext {
  application: FrameworkApplicationContext
}

export interface FrameworkClientContext {}

export type Module<ApplicationContext extends FrameworkApplicationContext, ApplicationOptions extends GenericRecord> = {
  name: string
  propertyTags?: () => Array<PropertyTag>
  initializeApplication: (options: ApplicationOptions) => Promise<ApplicationContext>
}
