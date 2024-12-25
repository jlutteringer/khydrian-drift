import { Environments, FrameworkApplicationContext, FrameworkApplicationOptions, FrameworkBrowseContext, Module } from '@bessemer/framework'
import { Objects, Preconditions, Properties } from '@bessemer/cornerstone'
import { PropertyRecord } from '@bessemer/cornerstone/property'

let applicationContext: FrameworkApplicationContext | null = null
const browseContextStore = new AsyncLocalStorage<{ context: any }>()

export const setContext = <T extends FrameworkBrowseContext>(context: T) => {
  browseContextStore.run({ context }, () => {})
}

export const getContext = <T extends FrameworkBrowseContext>(): T => {
  const store = browseContextStore.getStore()
  Preconditions.isPresent(store)
  return store.context
}

export const initialize = async <ApplicationContext extends FrameworkApplicationContext, ApplicationOptions extends FrameworkApplicationOptions>(
  module: Module<ApplicationContext, ApplicationOptions>,
  properties: PropertyRecord<ApplicationOptions>
): Promise<void> => {
  const propertyTags = [Environments.getEnvironmentTag(), ...(module.propertyTags?.() ?? [])]
  const options = Properties.resolve(properties, propertyTags)

  if (Objects.isNil(applicationContext)) {
    applicationContext = await module.initializeApplication(options)
  }

  return null!
}
