import { Ruleset } from '@simulacrum/common/ruleset'
import { CoreApplicationContext, CoreModule, CoreOptions } from '@bessemer/core/module'
import { Module } from '@bessemer/framework'
import { PropertyRecord } from '@bessemer/cornerstone/property'
import { Properties } from '@bessemer/cornerstone'

export type ApplicationOptions = CoreOptions & {
  ruleset: string
}

export type ApplicationContext = CoreApplicationContext & {
  ruleset: Ruleset
}

export type BrowseContext = {
  ruleset: Ruleset
  application: ApplicationContext
}

export const ApplicationOptions: PropertyRecord<ApplicationOptions> = Properties.properties({ ruleset: 'dnd' })

export const Application: Module<ApplicationContext, ApplicationOptions> = {
  name: 'Main Application',

  initializeApplication: async (options: ApplicationOptions): Promise<ApplicationContext> => {
    const coreContext = await CoreModule.initializeApplication(options)
    return null!
  },
}
