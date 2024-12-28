'use client'

import { PropsWithChildren } from 'react'
import { ApplicationClientProvider } from '@simulacrum/common/application/client'
import { ApplicationRuntimeProvider } from '@simulacrum/common/application/common'
import { BessemerClientProps } from '@bessemer/framework/bessemer'
import { Application, ApplicationOptions } from '@simulacrum/common/application'
import { ClientApplicationProvider } from '@bessemer/framework/use-client-application'

// JOHN rename
export const ClientApplicationProviderX = ({
  clientProps,
  children,
}: PropsWithChildren<{ clientProps: BessemerClientProps<Application, ApplicationOptions> }>) => {
  return (
    <ClientApplicationProvider
      provider={ApplicationClientProvider}
      runtime={ApplicationRuntimeProvider}
      clientProps={clientProps}
    >
      {children}
    </ClientApplicationProvider>
  )
}
