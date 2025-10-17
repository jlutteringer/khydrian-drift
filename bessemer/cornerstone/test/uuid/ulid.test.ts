import { Ulids } from '@bessemer/cornerstone'

describe('Ulids.from', () => {
  test('should parse valid Ulid string', () => {
    const validUlid = '01ARZ3NDEKTSV4RRFFQ69G5FAV'
    const result = Ulids.from(validUlid)
    expect(result).toBe(validUlid)
  })

  test('should parse Ulid with lowercase letters', () => {
    const lowercaseUlid = '01arz3ndektsv4rrffq69g5fav'
    const result = Ulids.from(lowercaseUlid)
    expect(result).toBe(lowercaseUlid.toUpperCase())
  })

  test('should throw error for invalid Ulid format', () => {
    expect(() => {
      Ulids.from('invalid-ulid')
    }).toThrow()
  })

  test('should throw error for Ulid with invalid characters', () => {
    expect(() => {
      Ulids.from('01ARZ3NDEKTSV4RRFFQ69G5FA!')
    }).toThrow()
  })

  test('should throw error for Ulid that is too short', () => {
    expect(() => {
      Ulids.from('01ARZ3NDEKTSV4RRFFQ69G5FA')
    }).toThrow()
  })

  test('should throw error for Ulid that is too long', () => {
    expect(() => {
      Ulids.from('01ARZ3NDEKTSV4RRFFQ69G5FAVX')
    }).toThrow()
  })
})

describe('Ulids.generate', () => {
  test('should generate valid ULID', () => {
    const ulid = Ulids.generate()

    expect(typeof ulid).toBe('string')
    expect(ulid).toHaveLength(26)
    expect(/^[0-9A-HJKMNP-TV-Z]{26}$/i.test(ulid)).toBe(true)
  })

  test('should generate different ULIDs on subsequent calls', () => {
    const ulid1 = Ulids.generate()
    const ulid2 = Ulids.generate()

    expect(ulid1).not.toBe(ulid2)
  })

  test('should generate ULIDs that are sortable by time', () => {
    const ulid1 = Ulids.generate()
    // Small delay to ensure different timestamp
    const start = Date.now()
    while (Date.now() - start < 2) {
      /* wait */
    }
    const ulid2 = Ulids.generate()

    expect(ulid1 < ulid2).toBe(true)
  })

  test('should generate multiple valid ULIDs', () => {
    const ulids = Array.from({ length: 10 }, () => Ulids.generate())

    ulids.forEach((ulid) => {
      expect(ulid).toHaveLength(26)
      expect(/^[0-9A-HJKMNP-TV-Z]{26}$/i.test(ulid)).toBe(true)
    })

    const uniqueUlids = new Set(ulids)
    expect(uniqueUlids.size).toBe(10)
  })
})
