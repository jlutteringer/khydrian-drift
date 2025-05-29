import { ulid } from 'ulid'
import { TaggedType } from '@bessemer/cornerstone/types'
import { Assertions, Strings } from '@bessemer/cornerstone'

export type Ulid = TaggedType<string, 'Ulid'>

export const generate = (): Ulid => {
  return ulid() as Ulid
}

export const asString = (value: Ulid): string => {
  return value
}

export const generateString = (): string => {
  return asString(generate())
}

export const of = (value: string): Ulid => {
  Assertions.assertTrue(isValid(value), () => `Attempted to coerce invalid value to Ulid: ${value}`)
  return value as Ulid
}

const pattern = /^[0-9A-HJKMNP-TV-Z]{26}$/

export const isValid = (value: unknown): value is Ulid => {
  return Strings.isString(value) && pattern.test(value)
}
