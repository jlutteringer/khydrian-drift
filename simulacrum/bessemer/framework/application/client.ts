import { BessemerApplication, BessemerClientApplication, BessemerClientProvider } from '@bessemer/framework'

export const BaseClientProvider: BessemerClientProvider<BessemerApplication, BessemerClientApplication> = {
  useTags: () => {
    return null
  },
  useInitializeClient: (initialClient) => initialClient,
}
