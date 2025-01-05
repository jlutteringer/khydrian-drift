import * as Bessemer from './bessemer'
import * as Environments from './environment'
import { Environment } from './environment'
import * as Routes from './route'
import { RouteErrorHandler } from './route'
import * as Contexts from './context'
import { PropertyRecord } from '@bessemer/cornerstone/property'
import { LoggerOptions } from '@bessemer/cornerstone/logger'
import { AbstractApplicationContext } from '@bessemer/cornerstone/context'
import { Tag } from '@bessemer/cornerstone/tag'

export { Bessemer, Routes, Environments, Contexts }

export type BessemerOptions = {
  logger?: LoggerOptions
  route?: {
    errorHandler?: RouteErrorHandler<any>
  }
  public?: {}
}

export type PublicOptions<T extends BessemerOptions> = T['public'] & {}

export type PublicProperties<T extends BessemerOptions> = PropertyRecord<PublicOptions<T>>

export type BessemerApplicationContext = AbstractApplicationContext & {
  route: {
    // TODO add some notion of middleware/interceptors/filters as well maybe?
    errorHandler: RouteErrorHandler
  }
  client: {
    environment: Environment
    tags: Array<Tag>
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
  globalTags: () => Array<Tag>
  configure: (options: ApplicationOptions) => void
  applicationTags: () => Promise<Array<Tag>>
  initializeApplication: (options: ApplicationOptions, runtime: ApplicationRuntimeType<ApplicationContext>) => Promise<ApplicationContext>
}

export type BessemerRuntimeModule<Application extends BessemerApplicationContext, ApplicationOptions extends BessemerOptions> = {
  initializeRuntime: (options: PublicOptions<ApplicationOptions>) => ApplicationRuntimeType<Application>
}

export type BessemerClientModule<
  ApplicationContext extends BessemerApplicationContext,
  ClientApplication extends ClientContextType<BessemerApplicationContext> = ClientContextType<BessemerApplicationContext>
> = {
  useTags: () => Array<Tag> | null
  useInitializeClient: (initialClient: ClientContextType<ApplicationContext>) => ClientApplication
}
