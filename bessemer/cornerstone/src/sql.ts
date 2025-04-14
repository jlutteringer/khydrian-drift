import * as Sql from '@bessemer/cornerstone/sql/sql'
import { BasicType, Dictionary, NominalType } from '@bessemer/cornerstone/types'

export { Sql }

export type SqlFragment = NominalType<string, 'SqlFragment'>
export type SqlParameterMap = Dictionary<BasicType | Array<BasicType>>
