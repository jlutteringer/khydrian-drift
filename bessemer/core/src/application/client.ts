import { CoreApplicationContext, CoreClientContext } from '@bessemer/core/application'
import { BessemerClientModule } from '@bessemer/framework'
import { usePathname } from 'next/navigation'
import { Objects } from '@bessemer/cornerstone'
import { BessemerNextClientModule } from '@bessemer/framework-next/application/client'

export const CoreClientModule: BessemerClientModule<CoreApplicationContext, CoreClientContext> = {
  useTags: BessemerNextClientModule.useTags,
  useInitializeClient: (initialClient) => {
    const baseClient = BessemerNextClientModule.useInitializeClient(initialClient)
    const pathname = usePathname()
    return Objects.deepMerge(baseClient, initialClient, {
      pathname,
    })
  },
}
