import { ulid } from 'ulid'
import { TaggedType } from '@bessemer/cornerstone/types'
import Zod, { ZodType } from 'zod/v4'

export type Ulid = TaggedType<string, 'Ulid'>
export const Schema: ZodType<Ulid> = Zod.string().regex(/^[0-9A-HJKMNP-TV-Z]{26}$/, 'Invalid ULID format') as any

export const of = (value: string): Ulid => {
  return value as Ulid
}

export const fromString = (value: string): Ulid => {
  return Schema.parse(value)
}

export const generate = (): Ulid => {
  return ulid() as Ulid
}
