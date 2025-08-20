import { TaggedType } from '@bessemer/cornerstone/types'
import Zod from 'zod'
import { isNil } from '@bessemer/cornerstone/object'
import { padStart } from '@bessemer/cornerstone/string'

export type Uuid = TaggedType<string, 'Uuid'>

export const of = (value: string): Uuid => {
  return value as Uuid
}

export const Schema = Zod.uuid().transform(of)

export const fromString = (value: string): Uuid => {
  return Schema.parse(value)
}

export const generate = (): Uuid => {
  if (isNil(crypto.randomUUID)) {
    return `${randomHex(8)}-${randomHex(4)}-${randomHex(4)}-${randomHex(4)}-${randomHex(12)}` as Uuid
  } else {
    return crypto.randomUUID() as Uuid
  }
}

const randomHex = (characters: number) => {
  // Generates a random number between 0x0..0 and 0xF..F for the target number of characters
  const randomNum = Math.floor(Math.random() * (16 ** characters - 1))
  return padStart(randomNum.toString(16), characters, '0')
}
