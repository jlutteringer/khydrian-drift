'use client'

import { isServer, QueryClient, QueryClientProvider as TanstackQueryClientProvider } from '@tanstack/react-query'
import { ReactNode } from 'react'

const makeQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

const getQueryClient = () => {
  if (isServer) {
    return makeQueryClient()
  } else {
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient()
    }
    return browserQueryClient
  }
}

// TODO move this to a more appropriate location
export const QueryClientProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = getQueryClient()
  return <TanstackQueryClientProvider client={queryClient}>{children}</TanstackQueryClientProvider>
}
