import 'server-only'
import { PropertyRecord } from '@bessemer/cornerstone/property'
import { Content, Properties } from '@bessemer/cornerstone'
import { ApplicationContext, ApplicationOptions } from '@simulacrum/common/application'
import { TextContentNormalizer } from '@bessemer/core/codex/normalizer'
import { CoreRouteErrorHandler } from '@bessemer/core/route'
import { ApplicationContent } from '@simulacrum/common/application/content'

const contentProvider = Content.staticProvider<ApplicationContext>(ApplicationContent, [TextContentNormalizer])

export const ApplicationProperties: PropertyRecord<ApplicationOptions> = Properties.properties({
  route: {
    errorHandler: CoreRouteErrorHandler,
  },
  ruleset: 'dnd',
  codex: {
    provider: contentProvider,
  },
  public: { test: 'hello' },
})
