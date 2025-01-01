import { Ruleset } from '@simulacrum/common/ruleset'
import { CoreApplication, CoreApplicationModule, CoreOptions } from '@bessemer/core/application'
import { Dnd5e } from '@simulacrum/rulesets/dnd-5e'
import { Objects } from '@bessemer/cornerstone'
import { serverOnlyTest } from '@simulacrum/common/server-only-test'
import { ApplicationRuntimeType, BessemerApplicationModule } from '@bessemer/framework'

export type ApplicationOptions = CoreOptions & {
  ruleset: string
  public: {
    test: string
  }
}

export type Application = CoreApplication & {
  serverOnlyTest: () => string
  client: {
    runtime: {
      test: () => string
    }
    ruleset: Ruleset
  }
}

export const ApplicationModule: BessemerApplicationModule<Application, ApplicationOptions> = {
  getTags: CoreApplicationModule.getTags,
  initializeApplication: async (options: ApplicationOptions, runtime: ApplicationRuntimeType<Application>): Promise<Application> => {
    const baseApplication = await CoreApplicationModule.initializeApplication(options, runtime)
    const application = Objects.merge(baseApplication, { serverOnlyTest, client: { ruleset: Dnd5e, runtime } })
    return application
  },
}
