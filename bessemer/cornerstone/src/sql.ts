import * as Sql from '@bessemer/cornerstone/sql/sql'
import { BasicType, Dictionary, TaggedType } from '@bessemer/cornerstone/types'

export {
  /**
   * @since 2.0.0
   */
  Sql,
}

export type SqlFragment = TaggedType<string, 'SqlFragment'>
export type SqlParameterMap = Dictionary<BasicType | Array<BasicType>>
