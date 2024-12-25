import { CodexOptions } from '@bessemer/core/codex'
import { InternationalizationOptions } from '@bessemer/core/internationalization'
import { FrameworkApplicationContext, FrameworkBrowseContext, Module } from '@bessemer/framework'

export type CoreOptions = {
  codex?: CodexOptions
  internationalization?: InternationalizationOptions
}

export type CoreApplicationContext = FrameworkApplicationContext & {
  codex?: CodexOptions
  internationalization?: InternationalizationOptions
}

export type CoreBrowseContext = FrameworkBrowseContext & CoreApplicationContext & {}

export const initialize = async () => {}

export const CoreModule: Module<CoreApplicationContext, CoreOptions> = {
  name: 'Core Module',

  initializeApplication: async (options: CoreOptions): Promise<CoreApplicationContext> => {
    return null!
  },
}
