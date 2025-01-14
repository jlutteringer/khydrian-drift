import { BessemerApplicationContext, ClientContextType } from '@bessemer/framework'
import { RscRuntimes } from '@bessemer/react'
import { use } from 'react'
import { useBessemerClientContext } from '@bessemer/framework-next/hooks/use-client-context'
import { BessemerNext } from '@bessemer/framework-next'

export const useBessemerCommonContext = <T extends BessemerApplicationContext>(): ClientContextType<T> => {
  if (RscRuntimes.isServer) {
    return use(BessemerNext.getApplication())
  } else {
    return useBessemerClientContext()
  }
}
