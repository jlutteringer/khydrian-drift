import { HexCodes } from '@bessemer/cornerstone'

describe('HexCode.parseString', () => {
  test('should accept valid hex codes', () => {
    const result1 = HexCodes.parseString('#FFF')
    expect(result1.isSuccess).toBe(true)
    if (result1.isSuccess) {
      expect(result1.value).toBe('#FFFFFF')
    }

    const result2 = HexCodes.parseString('#000000')
    expect(result2.isSuccess).toBe(true)
    if (result2.isSuccess) {
      expect(result2.value).toBe('#000000')
    }

    const result3 = HexCodes.parseString('#FFFFFF')
    expect(result3.isSuccess).toBe(true)
    if (result3.isSuccess) {
      expect(result3.value).toBe('#FFFFFF')
    }

    const result4 = HexCodes.parseString('#FF0000')
    expect(result4.isSuccess).toBe(true)
    if (result4.isSuccess) {
      expect(result4.value).toBe('#FF0000')
    }

    const result5 = HexCodes.parseString('#00FF00')
    expect(result5.isSuccess).toBe(true)
    if (result5.isSuccess) {
      expect(result5.value).toBe('#00FF00')
    }

    const result6 = HexCodes.parseString('#0000FF')
    expect(result6.isSuccess).toBe(true)
    if (result6.isSuccess) {
      expect(result6.value).toBe('#0000FF')
    }

    const result7 = HexCodes.parseString('#123456')
    expect(result7.isSuccess).toBe(true)
    if (result7.isSuccess) {
      expect(result7.value).toBe('#123456')
    }

    const result8 = HexCodes.parseString('#ABCDEF')
    expect(result8.isSuccess).toBe(true)
    if (result8.isSuccess) {
      expect(result8.value).toBe('#ABCDEF')
    }

    const result9 = HexCodes.parseString('#abcdef')
    expect(result9.isSuccess).toBe(true)
    if (result9.isSuccess) {
      expect(result9.value).toBe('#ABCDEF')
    }

    const result10 = HexCodes.parseString('#fFaAbB')
    expect(result10.isSuccess).toBe(true)
    if (result10.isSuccess) {
      expect(result10.value).toBe('#FFAABB')
    }
  })

  test('should reject hex codes without # prefix', () => {
    const invalidHexCodes = ['FF0000', '000000', 'ABCDEF']

    invalidHexCodes.forEach((hexCode) => {
      const result = HexCodes.parseString(hexCode)
      expect(result.isSuccess).toBe(false)
    })
  })

  test('should reject hex codes with wrong length', () => {
    const wrongLengthCodes = ['#', '#F', '#FF', '#FFFF', '#FFFFF', '#FFFFFFF', '#FFFFFFFF']

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
    expect(HexCodes.fromString('#FF0000')).toBe('#FF0000')
    expect(HexCodes.fromString('#00FF00')).toBe('#00FF00')
    expect(HexCodes.fromString('#0000FF')).toBe('#0000FF')
    expect(HexCodes.fromString('#FFfFFF')).toBe('#FFFFFF')
    expect(HexCodes.fromString('#000000')).toBe('#000000')
    expect(HexCodes.fromString('#abcdef')).toBe('#ABCDEF')
    expect(HexCodes.fromString('#FFF')).toBe('#FFFFFF')
  })

  test('should throw for invalid hex codes', () => {
    expect(() => HexCodes.fromString('FF0000')).toThrow() // Missing #
    expect(() => HexCodes.fromString('#GGGGGG')).toThrow() // Invalid characters
    expect(() => HexCodes.fromString('#FFFFFFF')).toThrow() // Too long
  })
})

describe('HexCode.Schema', () => {
  test('should parse valid hex codes through Zod schema', () => {
    const result1 = HexCodes.Schema.safeParse('#FFF')
    expect(result1.success).toBe(true)
    if (result1.success) {
      expect(result1.data).toBe('#FFFFFF')
    }

    const result2 = HexCodes.Schema.safeParse('#FF0000')
    expect(result2.success).toBe(true)
    if (result2.success) {
      expect(result2.data).toBe('#FF0000')
    }

    const result3 = HexCodes.Schema.safeParse('#00FF00')
    expect(result3.success).toBe(true)
    if (result3.success) {
      expect(result3.data).toBe('#00FF00')
    }

    const result4 = HexCodes.Schema.safeParse('#0000FF')
    expect(result4.success).toBe(true)
    if (result4.success) {
      expect(result4.data).toBe('#0000FF')
    }

    const result5 = HexCodes.Schema.safeParse('#FFFFFF')
    expect(result5.success).toBe(true)
    if (result5.success) {
      expect(result5.data).toBe('#FFFFFF')
    }

    const result6 = HexCodes.Schema.safeParse('#000000')
    expect(result6.success).toBe(true)
    if (result6.success) {
      expect(result6.data).toBe('#000000')
    }

    const result7 = HexCodes.Schema.safeParse('#abcdef')
    expect(result7.success).toBe(true)
    if (result7.success) {
      expect(result7.data).toBe('#ABCDEF')
    }
  })

  test('should reject invalid hex codes through Zod schema', () => {
    expect(HexCodes.Schema.safeParse('FF0000').success).toBe(false)
    expect(HexCodes.Schema.safeParse('#GGGGGG').success).toBe(false)
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
