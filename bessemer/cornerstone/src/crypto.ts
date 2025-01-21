export const getRandomBytes = (length: number): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(length))
}

export const getRandomHex = (length: number): string => {
  const bytes = getRandomBytes(length)
  // JOHN should Uint8Array to Hex String be a utility?
  const hashArray = Array.from(bytes)
  const hexString = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hexString
}
