import 'server-only'
import { PropertyRecord } from '@bessemer/cornerstone/property'
import { Content, Properties } from '@bessemer/cornerstone'
import { ApplicationOptions } from '@simulacrum/common/application'

const contentProvider = Content.staticProvider([])

export const ApplicationProperties: PropertyRecord<ApplicationOptions> = Properties.properties({
  ruleset: 'dnd',
  codex: {
    provider: contentProvider,
  },
  public: { test: 'hello' },
})
