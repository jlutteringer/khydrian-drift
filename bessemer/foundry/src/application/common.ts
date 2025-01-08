import { ApplicationRuntimeType, BessemerRuntimeModule, PublicOptions } from '@bessemer/framework'
import { CoreRuntimeModule } from '@bessemer/core/application/common'
import { FoundryApplicationContext, FoundryOptions } from '@bessemer/foundry/application'
import { LabelCodexRenderer, TextCodexRenderer } from '@bessemer/foundry/codex/renderers'

export const FoundryRuntimeModule: BessemerRuntimeModule<FoundryApplicationContext, FoundryOptions> = {
  initializeRuntime: (options: PublicOptions<FoundryOptions>): ApplicationRuntimeType<FoundryApplicationContext> => {
    const coreRuntime = CoreRuntimeModule.initializeRuntime(options)
    coreRuntime.codex.renderers = [...coreRuntime.codex.renderers, TextCodexRenderer, LabelCodexRenderer]
    return coreRuntime
  },
}
