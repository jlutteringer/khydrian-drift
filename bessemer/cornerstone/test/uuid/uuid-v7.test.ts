import { Uuid7 } from '@bessemer/cornerstone'

describe('Uuid7.from', () => {
  test('should parse valid UUID v7 string', () => {
    const validUuid = '018f4230-8b2e-7123-a456-123456789012'
    const result = Uuid7.from(validUuid)

    expect(typeof result).toBe('string')
    expect(result).toBe(validUuid.toLowerCase())
  })

  test('should parse UUID v7 with uppercase letters', () => {
    const uppercaseUuid = '018F4230-8B2E-7123-A456-123456789012'
    const result = Uuid7.from(uppercaseUuid)

    expect(result).toBe(uppercaseUuid.toLowerCase())
  })

  test('should throw error for invalid UUID format', () => {
    expect(() => {
      Uuid7.from('invalid-uuid')
    }).toThrow()
  })

  test('should throw error for UUID with invalid characters', () => {
    expect(() => {
      Uuid7.from('018f4230-8b2e-7123-a456-12345678901g')
    }).toThrow()
  })

  test('should throw error for UUID v4 (wrong version)', () => {
    expect(() => {
      Uuid7.from('018f4230-8b2e-4123-a456-123456789012')
    }).toThrow()
  })

  test('should throw error for UUID with wrong variant bits', () => {
    expect(() => {
      Uuid7.from('018f4230-8b2e-7123-c456-123456789012')
    }).toThrow()
  })

  test('should throw error for UUID that is too short', () => {
    expect(() => {
      Uuid7.from('018f4230-8b2e-7123-a456-12345678901')
    }).toThrow()
  })

  test('should throw error for UUID that is too long', () => {
    expect(() => {
      Uuid7.from('018f4230-8b2e-7123-a456-1234567890123')
    }).toThrow()
  })

  test('should throw error for UUID without hyphens', () => {
    expect(() => {
      Uuid7.from('018f42308b2e7123a456123456789012')
    }).toThrow()
  })
})

describe('Uuid7.generate', () => {
  test('should generate valid UUID v7', () => {
    const uuid = Uuid7.generate()

    expect(typeof uuid).toBe('string')
    expect(uuid).toHaveLength(36)
    expect(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid)).toBe(true)
  })

  test('should generate different UUIDs on subsequent calls', () => {
    const uuid1 = Uuid7.generate()
    const uuid2 = Uuid7.generate()

    expect(uuid1).not.toBe(uuid2)
  })

  test('should generate UUIDs that are sortable by time', () => {
    const uuid1 = Uuid7.generate()
    // Small delay to ensure different timestamp
    const start = Date.now()
    while (Date.now() - start < 2) {
      /* wait */
    }
    const uuid2 = Uuid7.generate()

    expect(uuid1 < uuid2).toBe(true)
  })

  test('should generate UUIDs that can be parsed back', () => {
    const generated = Uuid7.generate()
    const parsed = Uuid7.from(generated)

    expect(parsed).toBe(generated.toLowerCase())
  })

  test('should generate multiple valid UUIDs', () => {
    const uuids = Array.from({ length: 10 }, () => Uuid7.generate())

    uuids.forEach((uuid) => {
      expect(typeof uuid).toBe('string')
      expect(uuid).toHaveLength(36)
      expect(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid)).toBe(true)
    })

    // All should be unique
    const uniqueUuids = new Set(uuids)
    expect(uniqueUuids.size).toBe(10)
  })

  test('should generate UUID with correct version and variant bits', () => {
    const uuid = Uuid7.generate()
    const parts = uuid.split('-')

    // Version should be 7 (first character of third part)
    expect(parts[2]![0]).toBe('7')

    // Variant should be 8, 9, a, or b (first character of fourth part)
    expect(['8', '9', 'a', 'b']).toContain(parts[3]![0])
  })

  test('should generate UUIDs with timestamp-based ordering', () => {
    const uuids = Array.from({ length: 5 }, () => {
      const uuid = Uuid7.generate()
      // Small delay between generations
      const start = Date.now()
      while (Date.now() - start < 1) {
        /* wait */
      }
      return uuid
    })

    const sorted = [...uuids].sort()
    expect(uuids).toEqual(sorted)
  })
})
