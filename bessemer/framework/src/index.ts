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
import { CacheConfiguration } from '@bessemer/cornerstone/cache'
import * as Caches from '@bessemer/framework/cache'
import { CacheContext } from '@bessemer/framework/cache'
import { DEPRECATEDDeepPartial } from '@bessemer/cornerstone/types'
import { Ulid } from '@bessemer/cornerstone/ulid'

export { Bessemer, Environments, Contexts, AdvisoryLocks, Caches }

export type BessemerOptions = {
  logger?: LoggerOptions
  cache?: CacheConfiguration
  public?: {}
}

export type PublicOptions<T extends BessemerOptions> = T['public'] & {}

export type PublicProperties<T extends BessemerOptions> = PropertyRecord<PublicOptions<T>>

export type BessemerApplicationContext = AbstractApplicationContext & {
  id: string
  global: {
    buildId: string
    instanceId: Ulid

    cache: CacheContext
    advisoryLockProvider: AdvisoryLockProvider<any>
  }
  client: {
    correlationId: string
    environment: Environment
    tags: Array<Tag>
  }
}

export type GlobalContextType<T extends AbstractApplicationContext> = {
  global: T['global']
}

export type DehydratedContextType<T extends AbstractApplicationContext> = {
  client: Omit<T['client'], 'runtime'>
}

export type ClientContextType<T extends AbstractApplicationContext> = {
  client: T['client']
}

export type BessemerClientContext = ClientContextType<BessemerApplicationContext> & {}

export type ApplicationRuntimeType<T extends BessemerApplicationContext> = T['client']['runtime']

export type BessemerModule<ApplicationContext extends BessemerApplicationContext, ApplicationOptions extends BessemerOptions> = {
  global?: {
    tags?: (tags: Array<Tag>) => Array<Tag>
    configure?: (
      options: ApplicationOptions,
      context: DEPRECATEDDeepPartial<GlobalContextType<ApplicationContext>>
    ) => DEPRECATEDDeepPartial<GlobalContextType<ApplicationContext>>
    initialize?: (options: ApplicationOptions, context: GlobalContextType<ApplicationContext>) => void
  }
  tags?: (tags: Array<Tag>) => Promise<Array<Tag>>
  configure?: (options: ApplicationOptions, context: DEPRECATEDDeepPartial<ApplicationContext>) => Promise<DEPRECATEDDeepPartial<ApplicationContext>>
  dependencies?: Array<BessemerModule<ApplicationContext, ApplicationOptions>>
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
