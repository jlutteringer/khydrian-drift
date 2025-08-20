import { ulid } from 'ulid'
import { TaggedType } from '@bessemer/cornerstone/types'
import Zod from 'zod'

export type Ulid = TaggedType<string, 'Ulid'>

export const of = (value: string): Ulid => {
  return value as Ulid
}

export const Schema = Zod.string()
  .regex(/^[0-9A-HJKMNP-TV-Z]{26}$/, 'Invalid ULID format')
  .transform(of)

export const fromString = (value: string): Ulid => {
  return Schema.parse(value)
}

export const generate = (): Ulid => {
  return ulid() as Ulid
}
