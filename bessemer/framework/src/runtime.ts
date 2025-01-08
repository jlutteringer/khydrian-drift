import { TagType } from '@bessemer/cornerstone/tag'

export enum ApplicationRuntime {
  Edge = 'Edge',
  Api = 'Api',
  App = 'App',
  Page = 'Page',
}

export const ApplicationRuntimeTag: TagType<ApplicationRuntime> = 'ApplicationRuntime'
