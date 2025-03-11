import { BessemerModule } from '@bessemer/framework'
import { Objects } from '@bessemer/cornerstone'
import { DeepPartial } from '@bessemer/cornerstone/types'
import { CoreApplicationContext, CoreApplicationModule, CoreOptions } from '@bessemer/core/application'

export type ContentfulClientKeys = {
  // The contentful space id to use for requests
  spaceId: string

  // The contentful environment name to use for requests
  environmentName: string

  // The context delivery access token to use for securing requests
  contentDeliveryAccessToken: string

  // The preview access token
  contentPreviewAccessToken?: string
}

export type ContentfulOptions = CoreOptions & {
  contentful?: ContentfulClientKeys
}

export type ContentfulApplicationContext = CoreApplicationContext & {}

export const ContentfulApplicationModule: BessemerModule<ContentfulApplicationContext, ContentfulOptions> = {
  configure: async (options, context) => {
    if (Objects.isNil(options.contentful)) {
      return {}
    }

    const contentfulApplication: DeepPartial<ContentfulApplicationContext> = {}

    return contentfulApplication
  },
  dependencies: [CoreApplicationModule],
}
