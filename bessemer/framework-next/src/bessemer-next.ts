import { ServerContext } from '@bessemer/react/server-context'
import { Bessemer, BessemerApplicationContext, BessemerOptions } from '@bessemer/framework'
import { RscRuntimes, ServerContexts } from '@bessemer/react'
import { BessemerInstance } from '@bessemer/framework/bessemer'
import { Tag } from '@bessemer/cornerstone/tag'
import { Assertions } from '@bessemer/cornerstone'

const context: ServerContext<BessemerInstance<BessemerApplicationContext, BessemerOptions>> = ServerContexts.create()

export const getInstance = async <ApplicationContext extends BessemerApplicationContext, ApplicationOptions extends BessemerOptions>(
  tags?: Array<Tag>
): Promise<BessemerInstance<ApplicationContext, ApplicationOptions>> => {
  const instance = await context.fetchValue(() => Bessemer.initialize(tags))
  // JOHN fix cast?
  const response = instance as any as BessemerInstance<ApplicationContext, ApplicationOptions>
  return response
}

export const getApplication = async <ApplicationContext extends BessemerApplicationContext>(tags?: Array<Tag>): Promise<ApplicationContext> => {
  Assertions.assertTrue(RscRuntimes.isServer)

  const { context } = await getInstance<ApplicationContext, BessemerOptions>(tags)
  return context
}
