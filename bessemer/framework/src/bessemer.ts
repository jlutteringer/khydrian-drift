import {
  BessemerApplicationContext,
  BessemerModule,
  BessemerOptions,
  BessemerRuntimeModule,
  DehydratedContextType,
  GlobalContextType,
  PublicProperties,
} from '@bessemer/framework'
import { PropertyRecord } from '@bessemer/cornerstone/property'
import { Arrays, Hashes, Loggers, Objects, Preconditions, Properties, Tags } from '@bessemer/cornerstone'
import { RscRuntimes } from '@bessemer/react'
import { createGlobalVariable } from '@bessemer/cornerstone/global-variable'
import { Tag } from '@bessemer/cornerstone/tag'
import { DeepPartial } from '@bessemer/cornerstone/types'

const logger = Loggers.child('Bessemer')

export type BessemerInstance<ApplicationContext extends BessemerApplicationContext, ApplicationOptions extends BessemerOptions> = {
  context: ApplicationContext
  clientProps: BessemerClientProps<ApplicationContext, ApplicationOptions>
}

export type BessemerClientProps<ApplicationContext extends BessemerApplicationContext, ApplicationOptions extends BessemerOptions> = {
  dehydratedApplication: DehydratedContextType<ApplicationContext>
  publicProperties: PublicProperties<ApplicationOptions>
}

export type BessemerConfiguration<ApplicationContext extends BessemerApplicationContext, ApplicationOptions extends BessemerOptions> = {
  applicationProvider: BessemerModule<ApplicationContext, ApplicationOptions>
  runtimeProvider: BessemerRuntimeModule<ApplicationContext, ApplicationOptions>
  properties: PropertyRecord<ApplicationOptions>
}

const GlobalConfigurationState = createGlobalVariable<{
  configuration: BessemerConfiguration<any, any>
  globalContext: GlobalContextType<any>
} | null>('BessemerConfiguration', null)

export const configure = <ApplicationContext extends BessemerApplicationContext, ApplicationOptions extends BessemerOptions>(
  configuration: BessemerConfiguration<ApplicationContext, ApplicationOptions>
): void => {
  Preconditions.isTrue(RscRuntimes.isServer)

  if (Objects.isPresent(GlobalConfigurationState.getValue())) {
    return
  }

  const { applicationProvider, properties } = configuration

  const dependencyList = buildDependencyList(applicationProvider)
  const tags = dependencyList.reduce((tags, module) => module?.global?.tags?.(tags) ?? tags, [] as Array<Tag>)
  logger.info(() => `Configuring with tags: ${JSON.stringify(tags)}`)

  const options = Properties.resolve(properties, tags)
  const globalContext = dependencyList.reduce((context, module) => {
    const partialContext = module?.global?.configure?.(options, context as DeepPartial<GlobalContextType<ApplicationContext>>) ?? {}
    return Objects.merge(context, partialContext)
  }, {} as GlobalContextType<ApplicationContext>)

  dependencyList
    .map((it) => it?.global?.initialize)
    .filter(Objects.isPresent)
    .forEach((initialize) => initialize(options, globalContext))

  // JOHN validate that context is complete

  GlobalConfigurationState.setValue({
    configuration,
    globalContext,
  })
}

const getConfiguration = <ApplicationContext extends BessemerApplicationContext, ApplicationOptions extends BessemerOptions>(): BessemerConfiguration<
  ApplicationContext,
  ApplicationOptions
> => {
  Preconditions.isTrue(RscRuntimes.isServer)

  const state = GlobalConfigurationState.getValue()
  Preconditions.isPresent(state, 'Unable to resolve Bessemer configuration, did you call Bessemer.configure(...)?')
  return state.configuration
}

export const getGlobalContext = <ApplicationContext extends BessemerApplicationContext>(): GlobalContextType<ApplicationContext> => {
  Preconditions.isTrue(RscRuntimes.isServer)

  const state = GlobalConfigurationState.getValue()
  Preconditions.isPresent(state, 'Unable to resolve Bessemer configuration, did you call Bessemer.configure(...)?')
  return state.globalContext
}

export const initialize = async <ApplicationContext extends BessemerApplicationContext, ApplicationOptions extends BessemerOptions>(
  additionalTags: Array<Tag> = []
): Promise<BessemerInstance<ApplicationContext, ApplicationOptions>> => {
  const { applicationProvider, runtimeProvider, properties } = getConfiguration<ApplicationContext, ApplicationOptions>()
  const globalContext = getGlobalContext<ApplicationContext>()

  const dependencyList = buildDependencyList(applicationProvider)
  const globalTags = dependencyList.reduce((tags, module) => module?.global?.tags?.(tags) ?? tags, [] as Array<Tag>)
  const tags = await dependencyList.reduce(
    async (tags, module) => (await module?.tags?.(await tags)) ?? (await tags),
    Promise.resolve(Arrays.concatenate(globalTags, additionalTags))
  )
  logger.info(() => `Initializing Application with tags: ${JSON.stringify(tags)}`)

  const options = Properties.resolve(properties, tags)
  const context = await dependencyList.reduce(async (context, module) => {
    const awaitedContext = await context
    const partialContext = (await module?.configure?.(options, awaitedContext as DeepPartial<ApplicationContext>)) ?? {}
    return Objects.merge(awaitedContext, partialContext)
  }, Promise.resolve(globalContext as ApplicationContext))

  context.id = await Hashes.insecureHash(JSON.stringify(options))
  context.client.tags = tags
  context.client.runtime = runtimeProvider.initializeRuntime(options)

  // JOHN validate that context is complete
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

const buildDependencyList = <ApplicationContext extends BessemerApplicationContext, ApplicationOptions extends BessemerOptions>(
  module: BessemerModule<ApplicationContext, ApplicationOptions>
): Array<BessemerModule<ApplicationContext, ApplicationOptions>> => {
  const visited = new Set<BessemerModule<ApplicationContext, ApplicationOptions>>()
  const result: Array<BessemerModule<ApplicationContext, ApplicationOptions>> = []

  const visit = (
    currentModule: BessemerModule<ApplicationContext, ApplicationOptions>,
    path = new Set<BessemerModule<ApplicationContext, ApplicationOptions>>()
  ) => {
    if (path.has(currentModule)) {
      throw new Error('Circular dependency detected')
    }

    if (visited.has(currentModule)) {
      return
    }

    path.add(currentModule)

    const dependencies = currentModule.dependencies ?? []
    for (const dependency of dependencies) {
      visit(dependency, new Set(path))
    }

    visited.add(currentModule)
    result.push(currentModule)

    path.delete(currentModule)
  }

  // Start the traversal
  visit(module)
  return result
}
