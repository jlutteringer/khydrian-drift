// JOHN im gonna hate it but I should probably work on internationalization next...
// JOHN and then probably login...
import { NominalType } from '@bessemer/cornerstone/types'
import { TagType } from '@bessemer/cornerstone/tag'

export type InternationalizationOptions = {}

export type LocaleString = NominalType<string, 'LocaleString'>
export const LocaleTag: TagType<LocaleString> = 'Locale'
