'use client'

import { PropsWithChildren } from 'react'
import { ApplicationClientModule } from '@simulacrum/common/application/client'
import { ApplicationRuntimeModule } from '@simulacrum/common/application/common'
import { BessemerClientProps } from '@bessemer/framework/bessemer'
import { ApplicationContext, ApplicationOptions, ClientContext } from '@simulacrum/common/application'
import { BessemerClientProvider, useBessemerClient } from '@bessemer/framework/use-bessemer-client'

export const ClientApplicationProvider = ({
  props,
  children,
}: PropsWithChildren<{ props: BessemerClientProps<ApplicationContext, ApplicationOptions> }>) => {
  return (
    <BessemerClientProvider
      client={ApplicationClientModule}
      runtime={ApplicationRuntimeModule}
      props={props}
    >
      {children}
    </BessemerClientProvider>
  )
}

export function useClientApplication(): ClientContext {
  return useBessemerClient<ClientContext>()
}
