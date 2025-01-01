import { CodexOptions } from '@bessemer/core/codex'
import { InternationalizationOptions } from '@bessemer/core/internationalization'
import { ApplicationRuntimeType, BessemerApplication, BessemerApplicationModule, BessemerOptions } from '@bessemer/framework'
import { Objects } from '@bessemer/cornerstone'
import { BaseApplicationModule } from '@bessemer/framework/application'

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

export const CoreApplicationModule: BessemerApplicationModule<CoreApplication, CoreOptions> = {
  getTags: BaseApplicationModule.getTags,
  initializeApplication: async (options: CoreOptions, runtime: ApplicationRuntimeType<CoreApplication>): Promise<CoreApplication> => {
    const baseApplication = await BaseApplicationModule.initializeApplication(options, runtime)
    const application = Objects.merge(baseApplication, {
      client: {
        runtime: runtime,
      },
    })

    return application
  },
}
