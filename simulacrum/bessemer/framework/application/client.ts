import { BessemerApplication, BessemerClientProvider } from '@bessemer/framework'

export const BaseClientProvider: BessemerClientProvider<BessemerApplication> = {
  useTags: async () => {
    return null
  },
  useInitializeClient: (initialClient) => initialClient,
}
