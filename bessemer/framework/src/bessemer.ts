import {
  BessemerApplicationContext,
  BessemerApplicationModule,
  BessemerOptions,
  BessemerRuntimeModule,
  DehydratedContextType,
  PublicProperties
} from '@bessemer/framework'
import { PropertyRecord } from '@bessemer/cornerstone/property'
import { Loggers, Objects, Preconditions, Properties, Tags } from '@bessemer/cornerstone'
import { RscRuntimes, ServerContexts } from '@bessemer/react'
import { ServerContext } from '@bessemer/react/server-context'
import { createGlobalVariable } from '@bessemer/cornerstone/global-variable'
import { Tag } from '@bessemer/cornerstone/tag'

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
  Preconditions.isTrue(RscRuntimes.isServer)

  if (Objects.isPresent(GlobalConfigurationState.getValue())) {
    return
  }

  const { applicationProvider, properties } = configuration

  const tags = applicationProvider.globalTags()
  logger.info(() => `Configuring with tags: ${JSON.stringify(tags)}`)

  GlobalConfigurationState.setValue(configuration)
  const options = Properties.resolve(properties, tags)
  applicationProvider.configure(options)
}

const context: ServerContext<BessemerInstance<BessemerApplicationContext, BessemerOptions>> = ServerContexts.create()

export const getInstance = async <ApplicationContext extends BessemerApplicationContext, ApplicationOptions extends BessemerOptions>(
  tags?: Array<Tag>
): Promise<BessemerInstance<ApplicationContext, ApplicationOptions>> => {
  const response = (await context.fetchValue(() => initializeBessemer(tags))) as BessemerInstance<ApplicationContext, ApplicationOptions>
  return response
}

export const getApplication = async <ApplicationContext extends BessemerApplicationContext>(tags?: Array<Tag>): Promise<ApplicationContext> => {
  Preconditions.isTrue(RscRuntimes.isServer)

  const { context } = await getInstance<ApplicationContext, BessemerOptions>(tags)
  return context
}

const initializeBessemer = async <ApplicationContext extends BessemerApplicationContext, ApplicationOptions extends BessemerOptions>(
  additionalTags: Array<Tag> = []
): Promise<BessemerInstance<ApplicationContext, ApplicationOptions>> => {
  Preconditions.isTrue(RscRuntimes.isServer)

  const configuration = GlobalConfigurationState.getValue()
  Preconditions.isPresent(configuration, 'Unable to resolve Bessemer configuration, did you call Bessemer.configure(...)?')

  const { applicationProvider, runtimeProvider, properties } = configuration as BessemerConfiguration<ApplicationContext, ApplicationOptions>
  const tags = [...applicationProvider.globalTags(), ...(await applicationProvider.applicationTags()), ...additionalTags]
  logger.info(() => `Initializing Application with tags: ${JSON.stringify(tags)}`)

  const options = Properties.resolve(properties, tags)
  const runtime = runtimeProvider.initializeRuntime(options)

  const context = await applicationProvider.initializeApplication(options, runtime)
  context.client.tags = tags

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
      return Tags.value(it.value.public ?? {}, it.tags)
    })
  )
}
