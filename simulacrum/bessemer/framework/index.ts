import * as Bessemer from './bessemer'
import * as Environments from './environment'
import { Environment } from './environment'
import { PropertyRecord, PropertyTag } from '@bessemer/cornerstone/property'
import { LoggerOptions } from '@bessemer/cornerstone/logger'
import { AbstractApplicationContext } from '@bessemer/cornerstone/context'

export { Bessemer, Environments }

export type BessemerOptions = {
  logger?: LoggerOptions
  public?: {}
}

export type PublicOptions<T extends BessemerOptions> = T['public'] & {}

export type PublicProperties<T extends BessemerOptions> = PropertyRecord<PublicOptions<T>>

export type BessemerApplicationContext = AbstractApplicationContext & {
  client: {
    environment: Environment
    profile: Array<PropertyTag>
  }
}

export type DehydratedContextType<T extends BessemerApplicationContext> = {
  client: Omit<T['client'], 'runtime'>
}

export type ClientContextType<T extends BessemerApplicationContext> = {
  client: T['client']
}

export type BessemerClientContext = ClientContextType<BessemerApplicationContext> & {}

export type ApplicationRuntimeType<T extends BessemerApplicationContext> = T['client']['runtime']

export type BessemerApplicationModule<ApplicationContext extends BessemerApplicationContext, ApplicationOptions extends BessemerOptions> = {
  globalProfile: () => Array<PropertyTag>
  configure: (options: ApplicationOptions) => void
  applicationProfile: () => Promise<Array<PropertyTag>>
  initializeApplication: (options: ApplicationOptions, runtime: ApplicationRuntimeType<ApplicationContext>) => Promise<ApplicationContext>
}

export type BessemerRuntimeModule<Application extends BessemerApplicationContext, ApplicationOptions extends BessemerOptions> = {
  initializeRuntime: (options: PublicOptions<ApplicationOptions>) => ApplicationRuntimeType<Application>
}

export type BessemerClientModule<
  ApplicationContext extends BessemerApplicationContext,
  ClientApplication extends ClientContextType<BessemerApplicationContext> = ClientContextType<BessemerApplicationContext>
> = {
  useProfile: () => Array<PropertyTag> | null
  useInitializeClient: (initialClient: ClientContextType<ApplicationContext>) => ClientApplication
}
