import { NominalType } from '@bessemer/cornerstone/types'
import { Result, tryValue } from '@bessemer/cornerstone/result'
import Zod from 'zod'

export type IsoDate = NominalType<string, 'IsoDate'>

export const of = (value: string): IsoDate => {
  return value as IsoDate
}

export const Schema = Zod.string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/, 'Invalid Iso Date')
  .transform(of)

export const fromString = (value: string): IsoDate => {
  return Schema.parse(value)
}

export const parseString = (value: string): Result<IsoDate> => {
  return tryValue(() => fromString(value))
}

export const fromDate = (value: Date): IsoDate => {
  return of(value.toISOString())
}
