import React, { PropsWithChildren, use } from 'react'
import { BessemerClientProps } from '@bessemer/framework/bessemer'
import {
  ApplicationRuntimeType,
  BessemerApplication,
  BessemerClientApplication,
  BessemerClientProvider,
  BessemerOptions,
  BessemerRuntimeProvider,
  ClientApplicationType,
  DehydratedApplicationType,
} from '@bessemer/framework'
import { Preconditions, Properties } from '@bessemer/cornerstone'

const context = React.createContext<BessemerClientApplication | null>(null)

export function ClientApplicationProvider<
  Application extends BessemerApplication,
  ApplicationOptions extends BessemerOptions,
  ClientApplication extends ClientApplicationType<Application>
>({
  provider,
  runtime,
  clientProps,
  children,
}: PropsWithChildren<{
  provider: BessemerClientProvider<Application, ClientApplication>
  runtime: BessemerRuntimeProvider<Application, ApplicationOptions>
  clientProps: BessemerClientProps<Application, ApplicationOptions>
}>) {
  // JOHN cache probably?
  const tags = provider.useTags()
  const options = Properties.resolve(clientProps.publicProperties, tags ?? clientProps.dehydratedApplication.client.tags)
  const clientRuntime = runtime.initializeRuntime(options)
  const rehydratedApplication = hydrateApplication(clientProps.dehydratedApplication, clientRuntime)
  const clientApplication = provider.useInitializeClient(rehydratedApplication)
  return <context.Provider value={clientApplication}>{children}</context.Provider>
}

const hydrateApplication = <T extends BessemerApplication>(
  dehydratedContext: DehydratedApplicationType<T>,
  runtime: ApplicationRuntimeType<T>
): ClientApplicationType<T> => {
  return { client: { ...dehydratedContext.client, runtime } }
}

export function useClientApplication<T extends BessemerClientApplication>(): T {
  const clientApplication = use(context)
  Preconditions.isPresent(clientApplication)

  return clientApplication as T
}
