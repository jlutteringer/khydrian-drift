'use client'

import { PropsWithChildren } from 'react'
import { ApplicationClientModule, ClientApplication } from '@simulacrum/common/application/client'
import { ApplicationRuntimeModule } from '@simulacrum/common/application/common'
import { BessemerClientProps } from '@bessemer/framework/bessemer'
import { Application, ApplicationOptions } from '@simulacrum/common/application'
import { BessemerClientProvider, useBessemerClient } from '@bessemer/framework/use-bessemer-client'

export const ClientApplicationProvider = ({
  props,
  children,
}: PropsWithChildren<{ props: BessemerClientProps<Application, ApplicationOptions> }>) => {
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

export function useClientApplication(): ClientApplication {
  return useBessemerClient<ClientApplication>()
}
