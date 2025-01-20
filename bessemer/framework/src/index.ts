import * as Bessemer from '@bessemer/framework/bessemer'
import * as Environments from '@bessemer/framework/environment'
import { Environment } from '@bessemer/framework/environment'
import * as Contexts from '@bessemer/framework/context'
import * as AdvisoryLocks from '@bessemer/framework/advisory-lock'
import { AdvisoryLockProvider } from '@bessemer/framework/advisory-lock'
import { PropertyRecord } from '@bessemer/cornerstone/property'
import { LoggerOptions } from '@bessemer/cornerstone/logger'
import { AbstractApplicationContext } from '@bessemer/cornerstone/context'
import { Tag } from '@bessemer/cornerstone/tag'
import { CacheConfiguration, CacheContext } from '@bessemer/cornerstone/cache'
import * as Caches from '@bessemer/framework/cache'

export { Bessemer, Environments, Contexts, AdvisoryLocks, Caches }

export type BessemerOptions = {
  logger?: LoggerOptions
  cache?: CacheConfiguration
  public?: {}
}

export type PublicOptions<T extends BessemerOptions> = T['public'] & {}

export type PublicProperties<T extends BessemerOptions> = PropertyRecord<PublicOptions<T>>

// TODO we need the notion of a GLOBAL context :(
export type BessemerApplicationContext = AbstractApplicationContext & {
  cache: CacheContext
  advisoryLockProvider: AdvisoryLockProvider<any>
  client: {
    buildId: string
    instanceId: string
    correlationId: string

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
