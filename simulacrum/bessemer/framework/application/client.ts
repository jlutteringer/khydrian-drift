import { BessemerApplication, BessemerClientApplication, BessemerClientModule } from '@bessemer/framework'

export const BaseClientModule: BessemerClientModule<BessemerApplication, BessemerClientApplication> = {
  useTags: () => {
    return null
  },
  useInitializeClient: (initialClient) => initialClient,
}
