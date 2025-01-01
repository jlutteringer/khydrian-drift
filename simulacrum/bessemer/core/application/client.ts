import { CoreApplication } from '@bessemer/core/application'
import { BessemerClientApplication, BessemerClientModule, ClientApplicationType } from '@bessemer/framework'
import { usePathname } from 'next/navigation'
import { BaseClientModule } from '@bessemer/framework/application/client'
import { Objects } from '@bessemer/cornerstone'

export type CoreClientApplication = BessemerClientApplication &
  ClientApplicationType<CoreApplication> & {
    pathname: string
  }

export const CoreClientModule: BessemerClientModule<CoreApplication, CoreClientApplication> = {
  useTags: BaseClientModule.useTags,
  useInitializeClient: (initialClient) => {
    const baseClient = BaseClientModule.useInitializeClient(initialClient)
    const pathname = usePathname()

    return Objects.merge(baseClient, initialClient, {
      pathname,
    })
  },
}
