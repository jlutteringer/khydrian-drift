import { LabelContentType, StaticContentData, TextContentType } from '@bessemer/cornerstone/content'
import { Content, Tags } from '@bessemer/cornerstone'
import { LocaleTag } from '@bessemer/core/internationalization'
import { ApplicationRuntime, ApplicationRuntimeTag } from '@bessemer/framework/runtime'

export const ApplicationContent: Array<StaticContentData> = [
  Content.staticData('characters.title', LabelContentType, 'Charac<b>ters</b>'),
  Content.staticData('characters.create', LabelContentType, 'Create a Character'),
  Content.staticData('test-content', TextContentType, 'Hello, World!'),
  Content.staticData('test-content', TextContentType, 'Bonjour, World!', [Tags.tag(LocaleTag, 'fr-fr')]),
  Content.staticData('error-event.unhandled', TextContentType, 'Hello, <b>{{httpStatusCode}}</b>'),
  Content.staticData('error-event.unhandled', TextContentType, 'Hello from the Api. Your status code is: <b>{{httpStatusCode}}</b>', [
    Tags.tag(ApplicationRuntimeTag, ApplicationRuntime.Api),
  ]),
]
