import * as Bessemer from './bessemer'
import * as Environments from './environment'
import { Environment } from './environment'
import { PropertyRecord, PropertyTag } from '@bessemer/cornerstone/property'

export { Bessemer, Environments }

export type BessemerOptions = {
  public?: {}
}

export type PublicOptions<T extends BessemerOptions> = T['public'] & {}

export type PublicProperties<T extends BessemerOptions> = PropertyRecord<PublicOptions<T>>

export interface BessemerApplication {
  client: {
    environment: Environment
    tags: Array<PropertyTag>
    runtime: {}
  }
}

export type DehydratedApplicationType<T extends BessemerApplication> = {
  client: Omit<T['client'], 'runtime'>
}

export type ClientApplicationType<T extends BessemerApplication> = {
  client: T['client']
}

export interface BessemerClientApplication extends ClientApplicationType<BessemerApplication> {}

export type ApplicationRuntimeType<T extends BessemerApplication> = T['client']['runtime']

export type BessemerApplicationModule<Application extends BessemerApplication, ApplicationOptions extends BessemerOptions> = {
  getTags: () => Promise<Array<PropertyTag>>
  initializeApplication: (options: ApplicationOptions, runtime: ApplicationRuntimeType<Application>) => Promise<Application>
}

export type BessemerRuntimeModule<Application extends BessemerApplication, ApplicationOptions extends BessemerOptions> = {
  initializeRuntime: (options: PublicOptions<ApplicationOptions>) => ApplicationRuntimeType<Application>
}

export type BessemerClientModule<
  Application extends BessemerApplication,
  ClientApplication extends ClientApplicationType<BessemerApplication> = ClientApplicationType<BessemerApplication>
> = {
  useTags: () => Array<PropertyTag> | null
  useInitializeClient: (initialClient: ClientApplicationType<Application>) => ClientApplication
}
