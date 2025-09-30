import { NominalType } from '@bessemer/cornerstone/types'

export type LocalDate = NominalType<string, 'LocalDate'>
export type LocalDateInstance = {
  year: number
  month: number
  day: number
}
