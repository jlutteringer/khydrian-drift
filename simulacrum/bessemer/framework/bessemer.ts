import {
  BessemerApplicationContext,
  BessemerApplicationModule,
  BessemerOptions,
  BessemerRuntimeModule,
  DehydratedContextType,
  PublicProperties,
} from '@bessemer/framework'
import { PropertyRecord } from '@bessemer/cornerstone/property'
import { Loggers, Objects, Preconditions, Properties } from '@bessemer/cornerstone'
import { ServerContexts } from '@bessemer/react'
import { ServerContext } from '@bessemer/react/server-context'
import { createGlobalVariable } from '@bessemer/cornerstone/global-variable'

const logger = Loggers.child('Bessemer')

export type BessemerConfiguration<ApplicationContext extends BessemerApplicationContext, ApplicationOptions extends BessemerOptions> = {
  applicationProvider: BessemerApplicationModule<ApplicationContext, ApplicationOptions>
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

const GlobalConfigurationState = createGlobalVariable<BessemerConfiguration<any, any> | null>('BessemerConfiguration', null)

export const configure = <ApplicationContext extends BessemerApplicationContext, ApplicationOptions extends BessemerOptions>(
  configuration: BessemerConfiguration<ApplicationContext, ApplicationOptions>
): void => {
  Preconditions.isServerSide()

  if (Objects.isPresent(GlobalConfigurationState.getValue())) {
    return
  }

  const { applicationProvider, properties } = configuration

  const profile = applicationProvider.globalProfile()
  logger.info(() => `Configuring with profile: ${JSON.stringify(profile)}`)

  GlobalConfigurationState.setValue(configuration)
  const options = Properties.resolve(properties, profile)
  applicationProvider.configure(options)
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
  Preconditions.isServerSide()
  return getInstance<ApplicationContext, BessemerOptions>().context
}

const initializeBessemer = async <ApplicationContext extends BessemerApplicationContext, ApplicationOptions extends BessemerOptions>(): Promise<
  BessemerInstance<ApplicationContext, ApplicationOptions>
> => {
  Preconditions.isServerSide()

  const configuration = GlobalConfigurationState.getValue()
  Preconditions.isPresent(configuration, 'Unable to resolve Bessemer configuration, did you call Bessemer.configure(...)?')

  const { applicationProvider, runtimeProvider, properties } = configuration as BessemerConfiguration<ApplicationContext, ApplicationOptions>
  const profile = [...applicationProvider.globalProfile(), ...(await applicationProvider.applicationProfile())]

  logger.info(() => `Initializing Application with profile: ${JSON.stringify(profile)}`)

  const options = Properties.resolve(properties, profile)
  const runtime = runtimeProvider.initializeRuntime(options)

  const context = await applicationProvider.initializeApplication(options, runtime)
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
