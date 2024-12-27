import 'server-only'
import { PropertyRecord } from '@bessemer/cornerstone/property'
import { Properties } from '@bessemer/cornerstone'
import { ApplicationOptions } from '@simulacrum/common/application'

export const ApplicationProperties: PropertyRecord<ApplicationOptions> = Properties.properties({ ruleset: 'dnd', public: { test: 'hello' } })
