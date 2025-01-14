import { BessemerRuntimeModule } from '@bessemer/framework'
import { BaseRuntimeModule } from '@bessemer/framework/application/common'
import { BessemerNextApplicationContext, BessemerNextOptions } from '@bessemer/framework-next/application'

export const BessemerNextRuntimeModule: BessemerRuntimeModule<BessemerNextApplicationContext, BessemerNextOptions> = {
  initializeRuntime: BaseRuntimeModule.initializeRuntime
}
