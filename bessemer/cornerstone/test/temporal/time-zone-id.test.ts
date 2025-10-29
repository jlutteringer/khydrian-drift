import { TimeZoneIds } from '@bessemer/cornerstone'

describe('TimeZoneId.fromString', () => {
  test('should normalize valid IANA timezone identifiers', () => {
    {
      const result = TimeZoneIds.from('America/New_York')
      expect(result).toBe('America/New_York')
    }

    {
      const result = TimeZoneIds.from('america/new_york')
      expect(result).toBe('America/New_York')
    }

    {
      const result = TimeZoneIds.from('AMERICA/NEW_YORK')
      expect(result).toBe('America/New_York')
    }
  })

  test('should handle UTC timezone', () => {
    const result = TimeZoneIds.from('UTC')
    expect(result).toBe('UTC')
  })

  test('should normalize timezone aliases', () => {
    // GMT should normalize to UTC
    const result = TimeZoneIds.from('GMT')
    expect(result).toBe('UTC')
  })

  test('should handle common timezone identifiers', () => {
    const testCases = ['Europe/London', 'Asia/Tokyo', 'Australia/Sydney', 'America/Los_Angeles', 'Europe/Paris', 'Asia/Shanghai']

    testCases.forEach((timezone) => {
      expect(() => TimeZoneIds.from(timezone)).not.toThrow()
      const result = TimeZoneIds.from(timezone)
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })

  test('should throw for invalid timezone identifiers', () => {
    const invalidTimezones = ['Invalid/Timezone', 'America/NonExistent', 'Europe/FakeCity', 'Random/String', '']

    invalidTimezones.forEach((timezone) => {
      expect(() => TimeZoneIds.from(timezone)).toThrow()
    })
  })
})

describe('TimeZoneId.parseString', () => {
  test('should return success for valid timezone identifiers', () => {
    const result = TimeZoneIds.parseString('America/New_York')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe('America/New_York')
    }
  })

  test('should return success for UTC', () => {
    const result = TimeZoneIds.parseString('UTC')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe('UTC')
    }
  })

  test('should normalize GMT to UTC', () => {
    const result = TimeZoneIds.parseString('GMT')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe('UTC')
    }
  })

  test('should return failure for invalid timezone identifiers', () => {
    const invalidTimezones = ['Invalid/Timezone', 'America/NonExistent', 'Random/String', '']

    invalidTimezones.forEach((timezone) => {
      const result = TimeZoneIds.parseString(timezone)
      expect(result.isSuccess).toBe(false)
    })
  })

  test('should handle common valid timezones', () => {
    const validTimezones = [
      'Europe/London',
      'Asia/Tokyo',
      'Australia/Sydney',
      'America/Los_Angeles',
      'America/Chicago',
      'Europe/Paris',
      'Asia/Shanghai',
      'Pacific/Auckland',
    ]

    validTimezones.forEach((timezone) => {
      const result = TimeZoneIds.parseString(timezone)
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(typeof result.value).toBe('string')
        expect(result.value.length).toBeGreaterThan(0)
      }
    })
  })
})
