import { Ruleset } from '@simulacrum/common/ruleset'
import { Dnd5e } from '@simulacrum/rulesets/dnd-5e'
import { Objects, Tags, Urls } from '@bessemer/cornerstone'
import { serverOnlyTest } from '@simulacrum/common/server-only-test'
import { ApplicationRuntimeType, BessemerApplicationModule, ClientContextType } from '@bessemer/framework'
import { headers } from 'next/headers'
import { FoundryApplicationContext, FoundryApplicationModule, FoundryClientContext, FoundryOptions } from '@bessemer/foundry/application'
import { RedisApplicationContext, RedisApplicationModule, RedisOptions } from '@bessemer/redis/application'

export type ApplicationOptions = FoundryOptions &
  RedisOptions & {
    ruleset: string
    public: {
      test: string
    }
  }

export type ApplicationContext = FoundryApplicationContext &
  RedisApplicationContext & {
    serverOnlyTest: () => string
    client: {
      runtime: {
        test: () => string
      }
      ruleset: Ruleset
    }
  }

export type ClientContext = ClientContextType<ApplicationContext> & FoundryClientContext & {}

export const ApplicationModule: BessemerApplicationModule<ApplicationContext, ApplicationOptions> = {
  globalTags: FoundryApplicationModule.globalTags,
  configure: FoundryApplicationModule.configure,
  applicationTags: async () => {
    // TODO this is all janky test code
    const coreTags = await FoundryApplicationModule.applicationTags()
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
    const baseApplication = await FoundryApplicationModule.initializeApplication(options, runtime)
    const redisApplication = await RedisApplicationModule.initializeApplication(options, runtime)
    const application = Objects.merge(baseApplication, redisApplication, { serverOnlyTest, client: { ruleset: Dnd5e, runtime } })
    return application
  },
}
