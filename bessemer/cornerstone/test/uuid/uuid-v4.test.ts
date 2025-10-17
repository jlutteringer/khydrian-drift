import { Uuid4 } from '@bessemer/cornerstone'

describe('UuidV4s.from', () => {
  test('should parse valid UUID v4 string', () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000'
    const result = Uuid4.from(validUuid)

    expect(typeof result).toBe('string')
    expect(result).toBe(validUuid.toLowerCase())
  })

  test('should parse UUID v4 with uppercase letters', () => {
    const uppercaseUuid = '550E8400-E29B-41D4-A716-446655440000'
    const result = Uuid4.from(uppercaseUuid)

    expect(result).toBe(uppercaseUuid.toLowerCase())
  })

  test('should throw error for invalid UUID format', () => {
    expect(() => {
      Uuid4.from('invalid-uuid')
    }).toThrow()
  })

  test('should throw error for UUID with invalid characters', () => {
    expect(() => {
      Uuid4.from('550e8400-e29b-41d4-a716-44665544000g')
    }).toThrow()
  })

  test('should throw error for UUID that is too short', () => {
    expect(() => {
      Uuid4.from('550e8400-e29b-41d4-a716-44665544000')
    }).toThrow()
  })

  test('should throw error for UUID that is too long', () => {
    expect(() => {
      Uuid4.from('550e8400-e29b-41d4-a716-4466554400000')
    }).toThrow()
  })

  test('should throw error for UUID without hyphens', () => {
    expect(() => {
      Uuid4.from('550e8400e29b41d4a716446655440000')
    }).toThrow()
  })

  test('should throw error for UUID with wrong hyphen positions', () => {
    expect(() => {
      Uuid4.from('550e84-00e29b-41d4a7-16446655440000')
    }).toThrow()
  })
})

describe('UuidV4s.generate', () => {
  test('should generate valid UUID v4', () => {
    const uuid = Uuid4.generate()

    expect(typeof uuid).toBe('string')
    expect(uuid).toHaveLength(36)
    expect(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid)).toBe(true)
  })

  test('should generate different UUIDs on subsequent calls', () => {
    const uuid1 = Uuid4.generate()
    const uuid2 = Uuid4.generate()

    expect(uuid1).not.toBe(uuid2)
  })

  test('should generate UUIDs that can be parsed back', () => {
    const generated = Uuid4.generate()
    const parsed = Uuid4.from(generated)

    expect(parsed).toBe(generated.toLowerCase())
  })

  test('should generate multiple valid UUIDs', () => {
    const uuids = Array.from({ length: 10 }, () => Uuid4.generate())

    uuids.forEach((uuid) => {
      expect(typeof uuid).toBe('string')
      expect(uuid).toHaveLength(36)
      expect(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid)).toBe(true)
    })

    // All should be unique
    const uniqueUuids = new Set(uuids)
    expect(uniqueUuids.size).toBe(10)
  })

  test('should generate UUID with correct version and variant bits', () => {
    const uuid = Uuid4.generate()
    const parts = uuid.split('-')

    // Version should be 4 (first character of third part)
    expect(['1', '2', '3', '4', '5']).toContain(parts[2]![0])

    // Variant should be 8, 9, a, or b (first character of fourth part)
    expect(['8', '9', 'a', 'b']).toContain(parts[3]![0])
  })
})
