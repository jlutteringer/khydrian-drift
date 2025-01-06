import 'server-only'
import { PropertyRecord } from '@bessemer/cornerstone/property'
import { Content, Properties } from '@bessemer/cornerstone'
import { ApplicationContext, ApplicationOptions } from '@simulacrum/common/application'
import { LabelContentNormalizer, TextContentNormalizer } from '@bessemer/core/codex/normalizer'
import { CoreRouteErrorHandler } from '@bessemer/core/route'
import { ApplicationContent } from '@simulacrum/common/application/content'

// JOHN we should be able to load default normalizers from... somewhere? probaby should be on context
const contentProvider = Content.staticProvider<ApplicationContext>(ApplicationContent, [TextContentNormalizer, LabelContentNormalizer])

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
