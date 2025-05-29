import { Assertions, Objects, Strings } from '@bessemer/cornerstone'
import { TaggedType } from '@bessemer/cornerstone/types'

export type Uuid = TaggedType<string, 'Uuid'>

export const generate = (): Uuid => {
  if (Objects.isNil(crypto.randomUUID)) {
    return `${randomHex(8)}-${randomHex(4)}-${randomHex(4)}-${randomHex(4)}-${randomHex(12)}` as Uuid
  } else {
    return crypto.randomUUID() as Uuid
  }
}

export const asString = (value: Uuid): string => {
  return value
}

export const generateString = (): string => {
  return asString(generate())
}

const randomHex = (characters: number) => {
  // Generates a random number between 0x0..0 and 0xF..F for the target number of characters
  const randomNum = Math.floor(Math.random() * (16 ** characters - 1))
  return Strings.padStart(randomNum.toString(16), characters, '0')
}

export const of = (value: string): Uuid => {
  Assertions.assertTrue(isValid(value), () => `Attempted to coerce invalid value to Uuid: ${value}`)
  return value as Uuid
}

const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const isValid = (value: unknown): value is Uuid => {
  return Strings.isString(value) && pattern.test(value)
}
