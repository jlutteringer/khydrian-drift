import { CoreApplication } from '@bessemer/core/application'
import { BessemerClientProvider, ClientApplicationType } from '@bessemer/framework'
import { usePathname } from 'next/navigation'
import { BaseClientProvider } from '@bessemer/framework/application/client'

export type CoreClientApplication = ClientApplicationType<CoreApplication> & {
  pathname: string
}

export const CoreClientProvider: BessemerClientProvider<CoreApplication, CoreClientApplication> = {
  useTags: BaseClientProvider.useTags,
  useInitializeClient: (initialClient) => {
    const pathname = usePathname()
    return {
      ...initialClient,
      pathname,
    }
  },
}
