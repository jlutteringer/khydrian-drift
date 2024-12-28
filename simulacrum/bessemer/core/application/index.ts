import { CodexOptions } from '@bessemer/core/codex'
import { InternationalizationOptions } from '@bessemer/core/internationalization'
import { ApplicationRuntimeType, BessemerApplication, BessemerApplicationProvider, BessemerOptions } from '@bessemer/framework'
import { Objects } from '@bessemer/cornerstone'
import { BaseApplicationProvider } from '@bessemer/framework/application'

export type CoreOptions = BessemerOptions & {
  codex?: CodexOptions
  public?: {
    internationalization?: InternationalizationOptions
  }
}

export type CoreApplication = BessemerApplication & {
  codex?: CodexOptions

  client: {
    internationalization?: InternationalizationOptions
    runtime: {
      coreRuntimeTest: () => string
    }
  }
}

export const CoreApplicationProvider: BessemerApplicationProvider<CoreApplication, CoreOptions> = {
  getTags: BaseApplicationProvider.getTags,
  initializeApplication: async (options: CoreOptions, runtime: ApplicationRuntimeType<CoreApplication>): Promise<CoreApplication> => {
    const baseApplication = await BaseApplicationProvider.initializeApplication(options, runtime)
    const application = Objects.merge(baseApplication, {
      client: {
        runtime: runtime,
      },
    })

    return application
  },
}
