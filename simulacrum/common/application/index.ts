import { Ruleset } from '@simulacrum/common/ruleset'
import { CoreApplicationContext, CoreApplicationModule, CoreClientContext, CoreOptions } from '@bessemer/core/application'
import { Dnd5e } from '@simulacrum/rulesets/dnd-5e'
import { Objects, Properties, Urls } from '@bessemer/cornerstone'
import { serverOnlyTest } from '@simulacrum/common/server-only-test'
import { ApplicationRuntimeType, BessemerApplicationModule, ClientContextType } from '@bessemer/framework'
import { headers } from 'next/headers'

export type ApplicationOptions = CoreOptions & {
  ruleset: string
  public: {
    test: string
  }
}

export type ApplicationContext = CoreApplicationContext & {
  serverOnlyTest: () => string
  client: {
    runtime: {
      test: () => string
    }
    ruleset: Ruleset
  }
}

export type ClientContext = ClientContextType<ApplicationContext> & CoreApplicationContext & CoreClientContext & {}

export const ApplicationModule: BessemerApplicationModule<ApplicationContext, ApplicationOptions> = {
  globalProfile: CoreApplicationModule.globalProfile,
  configure: CoreApplicationModule.configure,
  applicationProfile: async () => {
    const coreProfile = await CoreApplicationModule.applicationProfile()
    const headersList = await headers()
    // for (const [key, value] of headersList.entries()) {
    //   console.log(key, value)
    // }

    const urlString = headersList.get('x-url')
    console.log('x-url', urlString)

    if (Objects.isNil(urlString)) {
      return coreProfile
    }

    const url = Urls.parse(urlString)
    if (url.location.path === '/subscription') {
      return [...coreProfile, Properties.tag('Tenant', 'subscription')]
    }

    return coreProfile
  },
  initializeApplication: async (options: ApplicationOptions, runtime: ApplicationRuntimeType<ApplicationContext>): Promise<ApplicationContext> => {
    const baseApplication = await CoreApplicationModule.initializeApplication(options, runtime)
    const application = Objects.merge(baseApplication, { serverOnlyTest, client: { ruleset: Dnd5e, runtime } })
    return application
  },
}
