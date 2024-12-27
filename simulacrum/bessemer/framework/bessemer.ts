import {
  ApplicationRuntimeType,
  BessemerApplication,
  BessemerApplicationProvider,
  BessemerOptions,
  BessemerRuntimeProvider,
  ClientApplicationType,
  DehydratedApplicationType,
} from '@bessemer/framework'
import { PropertyRecord } from '@bessemer/cornerstone/property'
import { Async, Durations, Properties } from '@bessemer/cornerstone'

export const dehydrateApplication = <T extends BessemerApplication>(context: T): DehydratedApplicationType<T> => {
  const { runtime, ...rest } = context.client
  return { client: rest } as DehydratedApplicationType<T>
}

export const hydrateApplication = <T extends BessemerApplication>(
  dehydratedContext: DehydratedApplicationType<T>,
  runtime: ApplicationRuntimeType<T>
): ClientApplicationType<T> => {
  return { client: { ...dehydratedContext.client, runtime } }
}

export type BessemerResult<Application extends BessemerApplication, ApplicationOptions extends BessemerOptions> = {
  application: Application
  options: ApplicationOptions
}

export const initializeBessemer = async <Application extends BessemerApplication, ApplicationOptions extends BessemerOptions>(
  applicationProvider: BessemerApplicationProvider<Application, ApplicationOptions>,
  runtimeProvider: BessemerRuntimeProvider<Application, ApplicationOptions>,
  properties: PropertyRecord<ApplicationOptions>
): Promise<BessemerResult<Application, ApplicationOptions>> => {
  await Async.sleep(Durations.ofMilliseconds(1000))

  const tags = await applicationProvider.getTags()
  const options = Properties.resolve(properties, tags)
  const runtime = runtimeProvider.initializeRuntime(options)
  const application = await applicationProvider.initializeApplication(options, runtime, tags)
  return { application, options }
}
