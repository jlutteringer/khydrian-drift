import { BessemerApplicationContext, ClientContextType } from '@bessemer/framework'

export const useBessemerCommonContext = <T extends BessemerApplicationContext>(): ClientContextType<T> => {
  // JOHN
  // if (RscRuntimes.isServer) {
  //   return use(Bessemer.getApplication())
  // } else {
  //   return useBessemerClientContext()
  // }
  return null!
}
