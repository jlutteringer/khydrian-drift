import {
  BessemerApplicationContext,
  BessemerApplicationModule,
  BessemerGlobalContext,
  BessemerOptions,
  BessemerRuntimeModule,
  DehydratedContextType,
  PublicProperties,
} from '@bessemer/framework'
import { PropertyRecord } from '@bessemer/cornerstone/property'
import { Logger, Preconditions, Properties } from '@bessemer/cornerstone'
import { ServerContexts } from '@bessemer/react'
import { ServerContext } from '@bessemer/react/server-context'

const logger = Logger.Primary.child({ module: 'Bessemer' })

export type BessemerConfiguration<
  GlobalContext extends BessemerGlobalContext,
  ApplicationContext extends BessemerApplicationContext,
  ApplicationOptions extends BessemerOptions
> = {
  applicationProvider: BessemerApplicationModule<GlobalContext, ApplicationContext, ApplicationOptions>
  runtimeProvider: BessemerRuntimeModule<ApplicationContext, ApplicationOptions>
  properties: PropertyRecord<ApplicationOptions>
}

export type BessemerInstance<ApplicationContext extends BessemerApplicationContext, ApplicationOptions extends BessemerOptions> = {
  context: ApplicationContext
  clientProps: BessemerClientProps<ApplicationContext, ApplicationOptions>
}

export type BessemerClientProps<ApplicationContext extends BessemerApplicationContext, ApplicationOptions extends BessemerOptions> = {
  dehydratedApplication: DehydratedContextType<ApplicationContext>
  publicProperties: PublicProperties<ApplicationOptions>
}

let BessemerConfiguration: { configuration: BessemerConfiguration<any, any, any>; context: BessemerGlobalContext } | null = null

export const configure = <
  GlobalContext extends BessemerGlobalContext,
  ApplicationContext extends BessemerApplicationContext,
  ApplicationOptions extends BessemerOptions
>(
  configuration: BessemerConfiguration<GlobalContext, ApplicationContext, ApplicationOptions>
): void => {
  const { applicationProvider, properties } = configuration
  Preconditions.isNil(BessemerConfiguration, 'Unable to configureBessemer after it has already be configured.')
  logger.info('Configuring Global Bessemer Settings...')

  const profile = applicationProvider.globalProfile()
  const options = Properties.resolve(properties, profile)
  BessemerConfiguration = { configuration, context: applicationProvider.configure(options) }
}

const context: ServerContext<BessemerInstance<BessemerApplicationContext, BessemerOptions>> = ServerContexts.create()

export const getInstance = <ApplicationContext extends BessemerApplicationContext, ApplicationOptions extends BessemerOptions>(): BessemerInstance<
  ApplicationContext,
  ApplicationOptions
> => {
  const response = context.fetchValue(initializeBessemer) as BessemerInstance<ApplicationContext, ApplicationOptions>
  return response
}

export const getApplication = <ApplicationContext extends BessemerApplicationContext>(): ApplicationContext => {
  return getInstance<ApplicationContext, BessemerOptions>().context
}

const initializeBessemer = async <ApplicationContext extends BessemerApplicationContext, ApplicationOptions extends BessemerOptions>(): Promise<
  BessemerInstance<ApplicationContext, ApplicationOptions>
> => {
  Preconditions.isPresent(BessemerConfiguration)
  logger.info('Initializing Bessemer for request')

  const { applicationProvider, runtimeProvider, properties } = BessemerConfiguration.configuration as BessemerConfiguration<
    any,
    ApplicationContext,
    ApplicationOptions
  >

  const profile = await applicationProvider.applicationProfile()
  const options = Properties.resolve(properties, profile)
  const runtime = runtimeProvider.initializeRuntime(options)

  const context = await applicationProvider.initializeApplication(options, BessemerConfiguration.context, runtime)
  context.client.profile = profile

  const dehydratedApplication = dehydrateApplication(context)
  const publicProperties = toPublicProperties(properties)
  return { context, clientProps: { dehydratedApplication, publicProperties } }
}

const dehydrateApplication = <T extends BessemerApplicationContext>(context: T): DehydratedContextType<T> => {
  const { runtime, ...rest } = context.client
  return { client: rest } as DehydratedContextType<T>
}

const toPublicProperties = <T extends BessemerOptions>(properties: PropertyRecord<T>): PublicProperties<T> => {
  return Properties.properties(
    properties.values.public ?? {},
    Object.values(properties.overrides).map((it) => {
      return { tags: it.tags, values: it.values.public ?? {} }
    })
  )
}
