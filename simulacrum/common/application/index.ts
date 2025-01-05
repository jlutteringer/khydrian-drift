import { Ruleset } from '@simulacrum/common/ruleset'
import { CoreApplicationContext, CoreApplicationModule, CoreClientContext, CoreOptions } from '@bessemer/core/application'
import { Dnd5e } from '@simulacrum/rulesets/dnd-5e'
import { Objects, Tags, Urls } from '@bessemer/cornerstone'
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

export type ClientContext = ClientContextType<ApplicationContext> & CoreClientContext & {}

export const ApplicationModule: BessemerApplicationModule<ApplicationContext, ApplicationOptions> = {
  globalTags: CoreApplicationModule.globalTags,
  configure: CoreApplicationModule.configure,
  applicationTags: async () => {
    // TODO this is all janky test code
    const coreTags = await CoreApplicationModule.applicationTags()
    const headersList = await headers()
    const urlString = headersList.get('x-url')

    if (Objects.isNil(urlString)) {
      return coreTags
    }

    const url = Urls.parse(urlString)
    if (url.location.path === '/subscription') {
      return [...coreTags, Tags.tag('Tenant', 'subscription')]
    }

    return coreTags
  },
  initializeApplication: async (options: ApplicationOptions, runtime: ApplicationRuntimeType<ApplicationContext>): Promise<ApplicationContext> => {
    const baseApplication = await CoreApplicationModule.initializeApplication(options, runtime)
    const application = Objects.merge(baseApplication, { serverOnlyTest, client: { ruleset: Dnd5e, runtime } })
    return application
  },
}
