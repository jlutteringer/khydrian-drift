import React, { PropsWithChildren, use } from 'react'
import { BessemerClientProps } from '@bessemer/framework/bessemer'
import {
  ApplicationRuntimeType,
  BessemerApplicationContext,
  BessemerClientContext,
  BessemerClientModule,
  BessemerOptions,
  BessemerRuntimeModule,
  ClientContextType,
  DehydratedContextType,
} from '@bessemer/framework'
import { Preconditions, Properties } from '@bessemer/cornerstone'

const BessemerContext = React.createContext<BessemerClientContext | null>(null)

export function BessemerClientProvider<
  Application extends BessemerApplicationContext,
  ApplicationOptions extends BessemerOptions,
  ClientApplication extends ClientContextType<Application>
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
  const profile = client.useProfile()
  const options = Properties.resolve(props.publicProperties, profile ?? props.dehydratedApplication.client.profile)
  const clientRuntime = runtime.initializeRuntime(options)
  const rehydratedApplication = hydrateApplication(props.dehydratedApplication, clientRuntime)
  const clientApplication = client.useInitializeClient(rehydratedApplication)
  return <BessemerContext.Provider value={clientApplication}>{children}</BessemerContext.Provider>
}

const hydrateApplication = <T extends BessemerApplicationContext>(
  dehydratedContext: DehydratedContextType<T>,
  runtime: ApplicationRuntimeType<T>
): ClientContextType<T> => {
  return { client: { ...dehydratedContext.client, runtime } }
}

export const useBessemerClient = <T extends BessemerClientContext>(): T => {
  const clientApplication = use(BessemerContext)
  Preconditions.isPresent(clientApplication)

  return clientApplication as T
}
