import {
  BessemerApplicationContext,
  BessemerClientContext,
  BessemerModule,
  BessemerOptions,
  ClientContextType,
  Environments,
} from '@bessemer/framework'
import { RouteErrorHandler } from '@bessemer/framework-next/route'
import { BaseApplicationModule } from '@bessemer/framework/application'
import * as fs from 'node:fs'
import { Ulids } from '@bessemer/cornerstone'

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

export type BessemerNextClientContext = BessemerClientContext & ClientContextType<BessemerNextApplicationContext> & {}

export const BessemerNextApplicationModule: BessemerModule<BessemerNextApplicationContext, BessemerNextOptions> = {
  global: {
    configure: () => {
      let buildId: string
      try {
        buildId = fs.readFileSync('.next/BUILD_ID').toString()
      } catch {
        // FUTURE this should be an enum? flag? something?
        if (Environments.getEnvironment() === 'development') {
          buildId = 'static'
        } else {
          buildId = Ulids.generate()
        }
      }

      return {
        global: {
          buildId,
        },
      }
    },
  },
  configure: async (options) => {
    return {
      route: {
        errorHandler: options.route?.errorHandler ?? null!,
      },
    }
  },
  dependencies: [BaseApplicationModule],
}
