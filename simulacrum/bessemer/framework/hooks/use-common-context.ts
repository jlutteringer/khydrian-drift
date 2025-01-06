import { Bessemer, BessemerApplicationContext, ClientContextType } from '@bessemer/framework'
import { RscRuntimes } from '@bessemer/react'
import { use } from 'react'
import { useBessemerClientContext } from '@bessemer/framework/hooks/use-client-context'

export const useBessemerCommonContext = <T extends BessemerApplicationContext>(): ClientContextType<T> => {
  if (RscRuntimes.isServer) {
    return use(Bessemer.getApplication())
  } else {
    return useBessemerClientContext()
  }
}
