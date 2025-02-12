import { ContentType } from '@bessemer/cornerstone/content'
import { Tag } from '@bessemer/cornerstone/tag'

export type CodexClientContext = {}

export type FetchContentOptions<Type extends ContentType> = { type?: Type; tags?: Array<Tag> }
