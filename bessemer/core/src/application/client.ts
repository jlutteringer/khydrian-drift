import { CoreApplicationContext, CoreClientContext } from '@bessemer/core/application'
import { BessemerClientModule } from '@bessemer/framework'
import { usePathname } from 'next/navigation'
import { BaseClientModule } from '@bessemer/framework/application/client'
import { Objects } from '@bessemer/cornerstone'
import { Expressions } from '@bessemer/cornerstone/expression'

export const CoreClientModule: BessemerClientModule<CoreApplicationContext, CoreClientContext> = {
  useTags: BaseClientModule.useTags,
  useInitializeClient: (initialClient) => {
    const baseClient = BaseClientModule.useInitializeClient(initialClient)
    const pathname = usePathname()

    console.log(Expressions.AndExpression)

    return Objects.merge(baseClient, initialClient, {
      pathname,
    })
  },
}
