import { StaticContentData, TextContentType } from '@bessemer/cornerstone/content'
import { Content, Tags } from '@bessemer/cornerstone'
import { LocaleTag } from '@bessemer/core/internationalization'
import { ApplicationRuntime, ApplicationRuntimeTag } from '@bessemer/framework/runtime'

// TODO need to test links as content - both inside and outside of Label mode... as well as a bunch of other content types
export const ApplicationContent: Array<StaticContentData> = [
  Content.staticData('characters.title', TextContentType, 'Charac<b>ters</b>'),
  Content.staticData('characters.create', TextContentType, 'Create a Character'),
  Content.staticData('character-builder.title', TextContentType, 'Character Builder'),
  Content.staticData('test-content', TextContentType, 'Hello, World!'),
  Content.staticData('test-content', TextContentType, 'Bonjour, World!', [Tags.tag(LocaleTag, 'fr-fr')]),
  Content.staticData('error-event.unhandled', TextContentType, 'Hello, <b>{{httpStatusCode}}</b>'),
  Content.staticData('error-event.unhandled', TextContentType, 'Hello from the Api. Your status code is: <b>{{httpStatusCode}}</b>', [
    Tags.tag(ApplicationRuntimeTag, ApplicationRuntime.Api),
  ]),
]
