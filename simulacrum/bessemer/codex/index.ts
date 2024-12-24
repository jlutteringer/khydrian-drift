import { Referencable } from '@bessemer/cornerstone/reference'
import { ContentReference } from '@bessemer/cornerstone/content'
import { ReactNode } from '@bessemer/react/type'

import * as Codex from './codex'

export { Codex }

export type CodexContext = {
  codex: CodexOptions
}

export type CodexOptions = {}

export type ContentLabel = Referencable<ContentReference> & {
  defaultValue?: ReactNode
}

export type ContentText = Referencable<ContentReference> & {
  defaultValue?: ReactNode
}
