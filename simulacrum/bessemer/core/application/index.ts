import { CodexOptions, CodexRuntime } from '@bessemer/core/codex'
import { InternationalizationOptions } from '@bessemer/core/internationalization'
import {
  ApplicationRuntimeType,
  BessemerApplicationContext,
  BessemerApplicationModule,
  BessemerClientContext,
  BessemerOptions,
  ClientContextType,
} from '@bessemer/framework'
import { Arrays, Objects } from '@bessemer/cornerstone'
import { BaseApplicationModule } from '@bessemer/framework/application'
import { Tiptap } from '@bessemer/core'
import { TiptapExtension } from '@bessemer/core/tiptap'

export type CoreOptions = BessemerOptions & {
  codex?: CodexOptions
  tiptapExtensions?: Array<TiptapExtension>

  public?: {
    internationalization?: InternationalizationOptions
  }
}

export type CoreApplicationContext = BessemerApplicationContext & {
  codex?: CodexOptions
  tiptapExtensions: Array<TiptapExtension>

  client: {
    internationalization?: InternationalizationOptions
    runtime: {
      codex: CodexRuntime
    }
  }
}

export type CoreClientContext = BessemerClientContext &
  ClientContextType<CoreApplicationContext> & {
    pathname: string
  }

export const CoreApplicationModule: BessemerApplicationModule<CoreApplicationContext, CoreOptions> = {
  globalTags: BaseApplicationModule.globalTags,
  configure: BaseApplicationModule.configure,
  applicationTags: BaseApplicationModule.applicationTags,
  initializeApplication: async (options: CoreOptions, runtime: ApplicationRuntimeType<CoreApplicationContext>): Promise<CoreApplicationContext> => {
    const baseApplication = await BaseApplicationModule.initializeApplication(options, runtime)

    const application = Objects.merge(baseApplication, {
      codex: options.codex && {
        provider: options.codex.provider,
      },
      tiptapExtensions: Arrays.concatenate(Tiptap.DefaultExtensions, options.tiptapExtensions ?? []),
      client: {
        runtime: runtime,
      },
    })

    return application
  },
}
