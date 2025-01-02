import { BessemerApplicationContext, BessemerClientContext, BessemerClientModule } from '@bessemer/framework'

export const BaseClientModule: BessemerClientModule<BessemerApplicationContext, BessemerClientContext> = {
  useProfile: () => {
    return null
  },
  useInitializeClient: (initialClient) => initialClient,
}
