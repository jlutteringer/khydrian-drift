// TODO im gonna hate it but I should probably work on internationalization next...
// TODO and then probably login...
import { TaggedType } from '@bessemer/cornerstone/types'
import { TagType } from '@bessemer/cornerstone/tag'

export type InternationalizationOptions = {}

export type LocaleString = TaggedType<string, 'LocaleString'>
export const LocaleTag: TagType<LocaleString> = 'Locale'
