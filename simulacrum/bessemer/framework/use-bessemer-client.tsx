import React, { PropsWithChildren, use } from 'react'
import { BessemerClientProps } from '@bessemer/framework/bessemer'
import {
  ApplicationRuntimeType,
  BessemerApplication,
  BessemerClientApplication,
  BessemerClientModule,
  BessemerOptions,
  BessemerRuntimeModule,
  ClientApplicationType,
  DehydratedApplicationType,
} from '@bessemer/framework'
import { Preconditions, Properties } from '@bessemer/cornerstone'

const BessemerContext = React.createContext<BessemerClientApplication | null>(null)

export function BessemerClientProvider<
  Application extends BessemerApplication,
  ApplicationOptions extends BessemerOptions,
  ClientApplication extends ClientApplicationType<Application>
>({
  client,
  runtime,
  props,
  children,
}: PropsWithChildren<{
  client: BessemerClientModule<Application, ClientApplication>
  runtime: BessemerRuntimeModule<Application, ApplicationOptions>
  props: BessemerClientProps<Application, ApplicationOptions>
}>) {
  const tags = client.useTags()
  const options = Properties.resolve(props.publicProperties, tags ?? props.dehydratedApplication.client.tags)
  const clientRuntime = runtime.initializeRuntime(options)
  const rehydratedApplication = hydrateApplication(props.dehydratedApplication, clientRuntime)
  const clientApplication = client.useInitializeClient(rehydratedApplication)
  return <BessemerContext.Provider value={clientApplication}>{children}</BessemerContext.Provider>
}

const hydrateApplication = <T extends BessemerApplication>(
  dehydratedContext: DehydratedApplicationType<T>,
  runtime: ApplicationRuntimeType<T>
): ClientApplicationType<T> => {
  return { client: { ...dehydratedContext.client, runtime } }
}

export function useBessemerClient<T extends BessemerClientApplication>(): T {
  const clientApplication = use(BessemerContext)
  Preconditions.isPresent(clientApplication)

  return clientApplication as T
}
