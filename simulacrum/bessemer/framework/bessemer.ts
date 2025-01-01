import {
  BessemerApplication,
  BessemerApplicationModule,
  BessemerOptions,
  BessemerRuntimeModule,
  DehydratedApplicationType,
  PublicProperties,
} from '@bessemer/framework'
import { PropertyRecord } from '@bessemer/cornerstone/property'
import { Preconditions, Properties } from '@bessemer/cornerstone'
import { ServerContexts } from '@bessemer/react'
import { ServerContext } from '@bessemer/react/server-context'

export type BessemerConfiguration<Application extends BessemerApplication, ApplicationOptions extends BessemerOptions> = {
  applicationProvider: BessemerApplicationModule<Application, ApplicationOptions>
  runtimeProvider: BessemerRuntimeModule<Application, ApplicationOptions>
  properties: PropertyRecord<ApplicationOptions>
}

export type BessemerInstance<Application extends BessemerApplication, ApplicationOptions extends BessemerOptions> = {
  application: Application
  clientProps: BessemerClientProps<Application, ApplicationOptions>
}

export type BessemerClientProps<Application extends BessemerApplication, ApplicationOptions extends BessemerOptions> = {
  dehydratedApplication: DehydratedApplicationType<Application>
  publicProperties: PublicProperties<ApplicationOptions>
}

let Configuration: BessemerConfiguration<any, any> | null = null

export const configure = <Application extends BessemerApplication, ApplicationOptions extends BessemerOptions>(
  configuration: BessemerConfiguration<Application, ApplicationOptions>
): void => {
  Preconditions.isNil(Configuration, 'Unable to configureBessemer after it has already be configured.')
  Configuration = configuration
}

const context: ServerContext<BessemerInstance<BessemerApplication, BessemerOptions>> = ServerContexts.create()

export const getInstance = <Application extends BessemerApplication, ApplicationOptions extends BessemerOptions>(): BessemerInstance<
  Application,
  ApplicationOptions
> => {
  const response = context.fetchValue(initializeBessemer) as BessemerInstance<Application, ApplicationOptions>
  return response
}

export const getApplication = <Application extends BessemerApplication>(): Application => {
  return getInstance<Application, BessemerOptions>().application
}

const initializeBessemer = async <Application extends BessemerApplication, ApplicationOptions extends BessemerOptions>(): Promise<
  BessemerInstance<Application, ApplicationOptions>
> => {
  Preconditions.isPresent(Configuration)

  const { applicationProvider, runtimeProvider, properties } = Configuration as BessemerConfiguration<Application, ApplicationOptions>
  const tags = await applicationProvider.getTags()
  const options = Properties.resolve(properties, tags)
  const runtime = runtimeProvider.initializeRuntime(options)

  const application = await applicationProvider.initializeApplication(options, runtime)
  application.client.tags = tags

  const dehydratedApplication = dehydrateApplication(application)
  const publicProperties = toPublicProperties(properties)
  return { application, clientProps: { dehydratedApplication, publicProperties } }
}

const dehydrateApplication = <T extends BessemerApplication>(context: T): DehydratedApplicationType<T> => {
  const { runtime, ...rest } = context.client
  return { client: rest } as DehydratedApplicationType<T>
}

const toPublicProperties = <T extends BessemerOptions>(properties: PropertyRecord<T>): PublicProperties<T> => {
  return Properties.properties(
    properties.values.public ?? {},
    Object.values(properties.overrides).map((it) => {
      return { tags: it.tags, values: it.values.public ?? {} }
    })
  )
}
