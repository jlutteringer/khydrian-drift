import 'server-only'
import { PropertyRecord } from '@bessemer/cornerstone/property'
import { Content, Properties } from '@bessemer/cornerstone'
import { ApplicationContext, ApplicationOptions } from '@simulacrum/common/application'
import { TextContentNormalizer } from '@bessemer/core/codex/normalizer'
import { CoreRouteErrorHandler } from '@bessemer/core/route'
import { TextContentType } from '@bessemer/cornerstone/content'

// JOHN possible to simplify config?
const contentProvider = Content.staticProvider<ApplicationContext>(
  [
    {
      reference: { id: 'test-content', type: 'Content' },
      type: TextContentType,
      data: 'Hello, World!',
    },
    {
      reference: { id: 'error-event.unhandled', type: 'Content' },
      type: TextContentType,
      data: '<p>Hello, <b>{{httpStatusCode}}</b></p>',
    },
  ],
  [TextContentNormalizer]
)

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
