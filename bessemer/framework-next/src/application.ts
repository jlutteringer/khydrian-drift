import {
  ApplicationRuntimeType,
  BessemerApplicationContext,
  BessemerApplicationModule,
  BessemerClientContext,
  BessemerOptions,
  ClientContextType
} from '@bessemer/framework'
import { BaseApplicationModule } from '@bessemer/framework/application'
import { RouteErrorHandler } from '@bessemer/framework-next/route'
import { Objects } from '@bessemer/cornerstone'

export type BessemerNextOptions = BessemerOptions & {
  route?: {
    errorHandler?: RouteErrorHandler<any>
  }
}

export type BessemerNextApplicationContext = BessemerApplicationContext & {
  route: {
    // TODO add some notion of middleware/interceptors/filters as well maybe?
    errorHandler: RouteErrorHandler
  }
}

export type BessemerNextClientContext = BessemerClientContext &
  ClientContextType<BessemerNextApplicationContext> & {

}

export const BessemerNextApplicationModule: BessemerApplicationModule<BessemerNextApplicationContext, BessemerNextOptions> = {
  globalTags: BaseApplicationModule.globalTags,
  configure: BaseApplicationModule.configure,
  applicationTags: BaseApplicationModule.applicationTags,
  initializeApplication: async (
    options: BessemerNextOptions,
    runtime: ApplicationRuntimeType<BessemerNextApplicationContext>
  ): Promise<BessemerNextApplicationContext> => {
    const baseApplication = await BaseApplicationModule.initializeApplication(options, runtime)

    const application = Objects.merge(baseApplication, {
      route: {
        errorHandler: options.route?.errorHandler ?? null!,
      },
      client: {
        runtime: runtime,
      },
    })

    return application
  },
}
