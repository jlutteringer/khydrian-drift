import { BessemerApplicationContext, BessemerClientContext, BessemerClientModule } from '@bessemer/framework'

export const BaseClientModule: BessemerClientModule<BessemerApplicationContext, BessemerClientContext> = {
  useTags: () => {
    return []
  },
  useInitializeClient: (initialClient) => initialClient,
}
