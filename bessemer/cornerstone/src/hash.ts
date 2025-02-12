import { TaggedType } from '@bessemer/cornerstone/types'

export type Hash = TaggedType<string, 'Hash'>

export enum HashAlgorithm {
  SHA1 = 'SHA-1',
  SHA256 = 'SHA-256',
}

export const asString = (value: Hash): string => {
  return value
}

export const insecureHash = async (message: string): Promise<Hash> => {
  return hash(message, HashAlgorithm.SHA1)
}

export const secureHash = async (message: string): Promise<Hash> => {
  return hash(message, HashAlgorithm.SHA256)
}

export const hash = async (message: string, algorithm: HashAlgorithm): Promise<Hash> => {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest(algorithm, msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hashHex as Hash
}
