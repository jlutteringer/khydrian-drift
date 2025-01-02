import { Ruleset } from '@simulacrum/common/ruleset'
import { CoreApplicationContext, CoreApplicationModule, CoreClientContext, CoreGlobalContext, CoreOptions } from '@bessemer/core/application'
import { Dnd5e } from '@simulacrum/rulesets/dnd-5e'
import { Objects } from '@bessemer/cornerstone'
import { serverOnlyTest } from '@simulacrum/common/server-only-test'
import { ApplicationRuntimeType, BessemerApplicationModule, ClientContextType } from '@bessemer/framework'

export type ApplicationOptions = CoreOptions & {
  ruleset: string
  public: {
    test: string
  }
}

export type GlobalContext = CoreGlobalContext & {}

export type ApplicationContext = CoreApplicationContext &
  GlobalContext & {
    serverOnlyTest: () => string
    client: {
      runtime: {
        test: () => string
      }
      ruleset: Ruleset
    }
  }

export type ClientContext = ClientContextType<ApplicationContext> & CoreApplicationContext & CoreClientContext & {}

export const ApplicationModule: BessemerApplicationModule<CoreGlobalContext, ApplicationContext, ApplicationOptions> = {
  globalProfile: CoreApplicationModule.globalProfile,
  configure: CoreApplicationModule.configure,
  applicationProfile: CoreApplicationModule.applicationProfile,
  initializeApplication: async (
    options: ApplicationOptions,
    global: GlobalContext,
    runtime: ApplicationRuntimeType<ApplicationContext>
  ): Promise<ApplicationContext> => {
    const baseApplication = await CoreApplicationModule.initializeApplication(options, global, runtime)
    const application = Objects.merge(baseApplication, { serverOnlyTest, client: { ruleset: Dnd5e, runtime } })
    return application
  },
}
