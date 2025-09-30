import { HexCodes } from '@bessemer/cornerstone'

describe('HexCode.parseString', () => {
  test('should accept valid hex codes', () => {
    const validHexCodes = ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#123456', '#ABCDEF', '#abcdef', '#fFaAbB']

    validHexCodes.forEach((hexCode) => {
      const result = HexCodes.parseString(hexCode)
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value).toBe(hexCode.toUpperCase())
      }
    })
  })

  test('should reject hex codes without # prefix', () => {
    const invalidHexCodes = ['FF0000', '000000', 'ABCDEF']

    invalidHexCodes.forEach((hexCode) => {
      const result = HexCodes.parseString(hexCode)
      expect(result.isSuccess).toBe(false)
    })
  })

  test('should reject hex codes with wrong length', () => {
    const wrongLengthCodes = ['#', '#F', '#FF', '#FFF', '#FFFF', '#FFFFF', '#FFFFFFF', '#FFFFFFFF']

    wrongLengthCodes.forEach((hexCode) => {
      const result = HexCodes.parseString(hexCode)
      expect(result.isSuccess).toBe(false)
    })
  })

  test('should reject hex codes with invalid characters', () => {
    const invalidCharacters = ['#GGGGGG', '#ZZZZZZ', '#12345G', '#ABCDEG', '#!@#$%^', '#      ', '#FF FF ', '#FF-000']

    invalidCharacters.forEach((hexCode) => {
      const result = HexCodes.parseString(hexCode)
      expect(result.isSuccess).toBe(false)
    })
  })

  test('should normalize to uppercase', () => {
    const mixedCaseCodes = ['#abcdef', '#AbCdEf', '#fFaAbB', '#123abc']

    const expectedUppercase = ['#ABCDEF', '#ABCDEF', '#FFAABB', '#123ABC']

    mixedCaseCodes.forEach((hexCode, index) => {
      const result = HexCodes.parseString(hexCode)
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value).toBe(expectedUppercase[index])
      }
    })
  })

  test('should handle edge cases', () => {
    // Empty string
    const emptyResult = HexCodes.parseString('')
    expect(emptyResult.isSuccess).toBe(false)

    // Only #
    const hashOnlyResult = HexCodes.parseString('#')
    expect(hashOnlyResult.isSuccess).toBe(false)

    // Multiple # symbols
    const multipleHashResult = HexCodes.parseString('##FFFFFF')
    expect(multipleHashResult.isSuccess).toBe(false)
  })
})

describe('HexCode.fromString', () => {
  test('should return HexCode for valid hex codes', () => {
    const validHexCodes = ['#FF0000', '#00FF00', '#0000FF', '#FFFFFF', '#000000', '#abcdef']

    validHexCodes.forEach((hexCode) => {
      const result = HexCodes.fromString(hexCode)
      expect(result).toBe(hexCode.toUpperCase())
    })
  })

  test('should throw for invalid hex codes', () => {
    const invalidHexCodes = [
      'FF0000', // Missing #
      '#GGGGGG', // Invalid characters
      '#FFF', // Wrong length
      '#FFFFFFF', // Too long
    ]

    invalidHexCodes.forEach((hexCode) => {
      expect(() => HexCodes.fromString(hexCode)).toThrow()
    })
  })
})

describe('HexCode.Schema', () => {
  test('should parse valid hex codes through Zod schema', () => {
    const validHexCodes = ['#FF0000', '#00FF00', '#0000FF', '#FFFFFF', '#000000', '#abcdef']

    validHexCodes.forEach((hexCode) => {
      const result = HexCodes.Schema.safeParse(hexCode)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe(hexCode.toUpperCase())
      }
    })
  })

  test('should reject invalid hex codes through Zod schema', () => {
    expect(HexCodes.Schema.safeParse('FF0000').success).toBe(false)
    expect(HexCodes.Schema.safeParse('#GGGGGG').success).toBe(false)
    expect(HexCodes.Schema.safeParse('#FFF').success).toBe(false)
    expect(HexCodes.Schema.safeParse('#FFFFFFF').success).toBe(false)
    expect(HexCodes.Schema.safeParse(123456).success).toBe(false)
    expect(HexCodes.Schema.safeParse(null).success).toBe(false)
    expect(HexCodes.Schema.safeParse(undefined).success).toBe(false)
  })

  test('should handle common color values', () => {
    const commonColors = [
      { input: '#ff0000', expected: '#FF0000' }, // Red
      { input: '#00ff00', expected: '#00FF00' }, // Green
      { input: '#0000ff', expected: '#0000FF' }, // Blue
      { input: '#ffffff', expected: '#FFFFFF' }, // White
      { input: '#000000', expected: '#000000' }, // Black
      { input: '#808080', expected: '#808080' }, // Gray
      { input: '#ffff00', expected: '#FFFF00' }, // Yellow
      { input: '#ff00ff', expected: '#FF00FF' }, // Magenta
      { input: '#00ffff', expected: '#00FFFF' }, // Cyan
    ]

    commonColors.forEach(({ input, expected }) => {
      const result = HexCodes.Schema.safeParse(input)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe(expected)
      }
    })
  })
})

describe('HexCode edge cases and validation', () => {
  test('should handle boundary hex values', () => {
    const boundaryValues = [
      '#000000', // Minimum
      '#FFFFFF', // Maximum
      '#800000', // Mid red
      '#008000', // Mid green
      '#000080', // Mid blue
    ]

    boundaryValues.forEach((hexCode) => {
      const result = HexCodes.parseString(hexCode)
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value).toBe(hexCode)
      }
    })
  })

  test('should handle whitespace and special characters', () => {
    const invalidInputs = [
      ' #FF0000', // Leading space
      '#FF0000 ', // Trailing space
      '# FF0000', // Space after #
      '#FF 0000', // Space in middle
      '#FF0000\n', // Newline
      '#FF0000\t', // Tab
      '\t#FF0000', // Leading tab
    ]

    invalidInputs.forEach((input) => {
      const result = HexCodes.parseString(input)
      expect(result.isSuccess).toBe(false)
    })
  })
})
