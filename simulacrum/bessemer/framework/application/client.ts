import { BessemerApplicationContext, BessemerClientContext, BessemerClientModule } from '@bessemer/framework'

export const BaseClientModule: BessemerClientModule<BessemerApplicationContext, BessemerClientContext> = {
  useTags: () => {
    return null
  },
  useInitializeClient: (initialClient) => initialClient,
}
