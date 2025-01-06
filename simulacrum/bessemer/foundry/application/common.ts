import { ApplicationRuntimeType, BessemerRuntimeModule, PublicOptions } from '@bessemer/framework'
import { CoreRuntimeModule } from '@bessemer/core/application/common'
import { FoundryApplicationContext, FoundryOptions } from '@bessemer/foundry/application'
import { LabelCodexRenderer, TextCodexRenderer } from '@bessemer/foundry/codex/renderers'
import { CodexRenderer } from '@bessemer/core/codex'

export const FoundryRuntimeModule: BessemerRuntimeModule<FoundryApplicationContext, FoundryOptions> = {
  initializeRuntime: (options: PublicOptions<FoundryOptions>): ApplicationRuntimeType<FoundryApplicationContext> => {
    const coreRuntime = CoreRuntimeModule.initializeRuntime(options)
    // JOHN fix ugly cast
    coreRuntime.codex.renderers.push(TextCodexRenderer as CodexRenderer)
    coreRuntime.codex.renderers.push(LabelCodexRenderer as CodexRenderer)
    return coreRuntime
  },
}
