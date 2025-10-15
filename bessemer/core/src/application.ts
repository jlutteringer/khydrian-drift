import { CodexOptions, CodexRuntime } from '@bessemer/core/codex'
import { InternationalizationOptions } from '@bessemer/core/internationalization'
import { BessemerModule, ClientContextType } from '@bessemer/framework'
import { Arrays } from '@bessemer/cornerstone'
import { Tiptap } from '@bessemer/core'
import { TiptapExtension } from '@bessemer/core/tiptap'
import {
  BessemerNextApplicationContext,
  BessemerNextApplicationModule,
  BessemerNextClientContext,
  BessemerNextOptions,
} from '@bessemer/framework-next/application'
import { DEPRECATEDDeepPartial } from '@bessemer/cornerstone/types'

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

export const CoreApplicationModule: BessemerModule<CoreApplicationContext, CoreOptions> = {
  configure: async (options) => {
    const application: DEPRECATEDDeepPartial<CoreApplicationContext> = {
      codex: options.codex && {
        provider: options.codex.provider,
      },
      tiptapExtensions: Arrays.concatenate(Tiptap.DefaultExtensions, options.tiptapExtensions ?? []),
    }

    return application
  },
  dependencies: [BessemerNextApplicationModule],
}
