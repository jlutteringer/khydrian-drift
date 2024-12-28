import { CoreApplication } from '@bessemer/core/application'
import { BessemerClientApplication, BessemerClientProvider, ClientApplicationType } from '@bessemer/framework'
import { usePathname } from 'next/navigation'
import { BaseClientProvider } from '@bessemer/framework/application/client'
import { Objects } from '@bessemer/cornerstone'

export type CoreClientApplication = BessemerClientApplication &
  ClientApplicationType<CoreApplication> & {
    pathname: string
  }

export const CoreClientProvider: BessemerClientProvider<CoreApplication, CoreClientApplication> = {
  useTags: BaseClientProvider.useTags,
  useInitializeClient: (initialClient) => {
    const baseClient = BaseClientProvider.useInitializeClient(initialClient)
    const pathname = usePathname()

    return Objects.merge(baseClient, initialClient, {
      pathname,
    })
  },
}
