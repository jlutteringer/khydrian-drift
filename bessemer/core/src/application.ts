import { CodexOptions, CodexRuntime } from '@bessemer/core/codex'
import { InternationalizationOptions } from '@bessemer/core/internationalization'
import { ApplicationRuntimeType, BessemerApplicationModule, ClientContextType } from '@bessemer/framework'
import { Arrays, Objects } from '@bessemer/cornerstone'
import { Tiptap } from '@bessemer/core'
import { TiptapExtension } from '@bessemer/core/tiptap'
import {
  BessemerNextApplicationContext,
  BessemerNextApplicationModule,
  BessemerNextClientContext,
  BessemerNextOptions
} from '@bessemer/framework-next/application'

export type CoreOptions = BessemerNextOptions & {
  codex?: CodexOptions
  tiptapExtensions?: Array<TiptapExtension>

  public?: {
    internationalization?: InternationalizationOptions
  }
}

export type CoreApplicationContext = BessemerNextApplicationContext & {
  codex?: CodexOptions
  tiptapExtensions: Array<TiptapExtension>

  client: {
    internationalization?: InternationalizationOptions
    runtime: {
      codex: CodexRuntime
    }
  }
}

export type CoreClientContext = BessemerNextClientContext &
  ClientContextType<CoreApplicationContext> & {
  pathname: string
}

export const CoreApplicationModule: BessemerApplicationModule<CoreApplicationContext, CoreOptions> = {
  globalTags: BessemerNextApplicationModule.globalTags,
  configure: BessemerNextApplicationModule.configure,
  applicationTags: BessemerNextApplicationModule.applicationTags,
  initializeApplication: async (options: CoreOptions, runtime: ApplicationRuntimeType<CoreApplicationContext>): Promise<CoreApplicationContext> => {
    const baseApplication = await BessemerNextApplicationModule.initializeApplication(options, runtime)

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
