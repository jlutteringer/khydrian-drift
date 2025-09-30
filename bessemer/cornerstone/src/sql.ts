import * as Sql from '@bessemer/cornerstone/sql/sql'
import { BasicType, Dictionary, TaggedType } from '@bessemer/cornerstone/types'

export { Sql }

export type SqlFragment = TaggedType<string, 'SqlFragment'>
export type SqlParameterMap = Dictionary<BasicType | Array<BasicType>>
