import { Objects, Strings } from '@bessemer/cornerstone'

// JOHN we also want to add ULID support: https://github.com/ulid/javascript
export type Uuid = string

export const random = (): Uuid => {
  if (Objects.isNil(crypto.randomUUID)) {
    return `${randomHex(8)}-${randomHex(4)}-${randomHex(4)}-${randomHex(4)}-${randomHex(12)}`
  } else {
    return crypto.randomUUID()
  }
}

const randomHex = (characters: number) => {
  // Generates a random number between 0x0..0 and 0xF..F for the target number of characters
  const randomNum = Math.floor(Math.random() * (16 ** characters - 1))
  return Strings.padStart(randomNum.toString(16), characters, '0')
}
