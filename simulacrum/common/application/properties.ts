import 'server-only'
import { PropertyRecord } from '@bessemer/cornerstone/property'
import { Content, Properties, Tags } from '@bessemer/cornerstone'
import { ApplicationContext, ApplicationOptions } from '@simulacrum/common/application'
import { TextContentNormalizer } from '@bessemer/core/codex/normalizer'
import { CoreRouteErrorHandler } from '@bessemer/core/route'
import { TextContentType } from '@bessemer/cornerstone/content'
import { ApplicationRuntime, ApplicationRuntimeTag } from '@bessemer/framework/runtime'
import { LocaleTag } from '@bessemer/core/internationalization'

// JOHN possible to simplify config?
const contentProvider = Content.staticProvider<ApplicationContext>(
  [
    Content.staticData('test-content', TextContentType, 'Hello, World!'),
    Content.staticData('test-content', TextContentType, 'Bonjour, World!', [Tags.tag(LocaleTag, 'fr-fr')]),
    Content.staticData('error-event.unhandled', TextContentType, 'Hello, <b>{{httpStatusCode}}</b>'),
    Content.staticData('error-event.unhandled', TextContentType, 'Hello from the Api. Your status code is: <b>{{httpStatusCode}}</b>', [
      Tags.tag(ApplicationRuntimeTag, ApplicationRuntime.Api),
    ]),
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
