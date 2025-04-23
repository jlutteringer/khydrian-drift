import { BessemerClientModule } from '@bessemer/framework'
import { BaseClientModule } from '@bessemer/framework/application/client'
import { BessemerNextApplicationContext, BessemerNextClientContext } from '@bessemer/framework-next/application'
import { Objects } from '@bessemer/cornerstone'

export const BessemerNextClientModule: BessemerClientModule<BessemerNextApplicationContext, BessemerNextClientContext> = {
  useTags: BaseClientModule.useTags,
  useInitializeClient: (initialClient): BessemerNextClientContext => {
    const coreClient = BaseClientModule.useInitializeClient(initialClient)
    return Objects.deepMerge(coreClient, initialClient, {})
  },
}
