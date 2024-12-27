import { Ruleset } from '@simulacrum/common/ruleset'
import { CoreApplication, CoreApplicationProvider, CoreOptions } from '@bessemer/core/application'
import { Dnd5e } from '@simulacrum/rulesets/dnd-5e'
import { Objects } from '@bessemer/cornerstone'
import { serverOnlyTest } from '@simulacrum/common/server-only-test'
import { ApplicationRuntimeType, BessemerApplicationProvider } from '@bessemer/framework'
import { PropertyTag } from '@bessemer/cornerstone/property'

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

export const ApplicationProvider: BessemerApplicationProvider<Application, ApplicationOptions> = {
  getTags: CoreApplicationProvider.getTags,
  initializeApplication: async (
    options: ApplicationOptions,
    runtime: ApplicationRuntimeType<Application>,
    tags: Array<PropertyTag>
  ): Promise<Application> => {
    const baseApplication = await CoreApplicationProvider.initializeApplication(options, runtime, tags)
    const application = Objects.merge(baseApplication, { serverOnlyTest, client: { ruleset: Dnd5e, runtime } })
    return application
  },
}
