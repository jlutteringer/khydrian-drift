import { Globs } from '@bessemer/cornerstone'

describe('Glob.parseString', () => {
  test('should accept simple patterns', () => {
    const result = Globs.parseString('*.js')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe('*.js')
    }
  })

  test('should accept patterns with forward slashes', () => {
    const result = Globs.parseString('src/**/*.ts')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe('src/**/*.ts')
    }
  })

  test('should accept patterns with backslashes', () => {
    const result = Globs.parseString('src\\**\\*.ts')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe('src\\**\\*.ts')
    }
  })

  test('should accept patterns with brackets', () => {
    const result = Globs.parseString('*.{js,ts}')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe('*.{js,ts}')
    }
  })

  test('should accept patterns with character classes', () => {
    const result = Globs.parseString('[a-z]*.txt')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe('[a-z]*.txt')
    }
  })

  test('should accept patterns with negation', () => {
    const result = Globs.parseString('!node_modules')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe('!node_modules')
    }
  })

  test('should accept patterns with pipes', () => {
    const result = Globs.parseString('src/**/*.{js|ts}')
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value).toBe('src/**/*.{js|ts}')
    }
  })

  test('should reject patterns with invalid characters', () => {
    const invalidPatterns = ['file@name.txt', 'file#name.txt', 'file$name.txt', 'file%name.txt', 'file&name.txt']

    invalidPatterns.forEach((pattern) => {
      const result = Globs.parseString(pattern)
      expect(result.isSuccess).toBe(false)
    })
  })

  test('should reject patterns with unbalanced brackets', () => {
    const unbalancedBrackets = ['[abc', 'abc]', '[ab[c]', '[abc]]']

    unbalancedBrackets.forEach((pattern) => {
      const result = Globs.parseString(pattern)
      expect(result.isSuccess).toBe(false)
    })
  })

  test('should reject patterns with unbalanced braces', () => {
    const unbalancedBraces = ['{js,ts', 'js,ts}', '{{js,ts}']

    unbalancedBraces.forEach((pattern) => {
      const result = Globs.parseString(pattern)
      expect(result.isSuccess).toBe(false)
    })
  })

  test('should accept balanced nested brackets and braces', () => {
    const validNested = ['{[a-z],*.js}', '[{a,b}]', '*.{[jt]s}']

    validNested.forEach((pattern) => {
      const result = Globs.parseString(pattern)
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value).toBe(pattern)
      }
    })
  })
})

describe('Glob.fromString', () => {
  test('should return GlobPattern for valid patterns', () => {
    const validPatterns = ['*.js', 'src/**/*.ts', '*.{js,ts}', '[a-z]*.txt']

    validPatterns.forEach((pattern) => {
      const result = Globs.fromString(pattern)
      expect(result).toBe(pattern)
    })
  })

  test('should throw for invalid patterns', () => {
    const invalidPatterns = ['file@name.txt', '[abc', '{js,ts']

    invalidPatterns.forEach((pattern) => {
      expect(() => Globs.fromString(pattern)).toThrow()
    })
  })
})

describe('Glob.match', () => {
  test('should match simple wildcard patterns', () => {
    const pattern = Globs.fromString('*.js')

    expect(Globs.match('file.js', pattern)).toBe(true)
    expect(Globs.match('script.js', pattern)).toBe(true)
    expect(Globs.match('file.ts', pattern)).toBe(false)
    expect(Globs.match('file.js.bak', pattern)).toBe(false)
  })

  test('should match double-star patterns', () => {
    const pattern = Globs.fromString('src/**/*.ts')

    expect(Globs.match('src/index.ts', pattern)).toBe(true)
    expect(Globs.match('src/utils/helper.ts', pattern)).toBe(true)
    expect(Globs.match('src/deep/nested/path/file.ts', pattern)).toBe(true)
    expect(Globs.match('src/file.js', pattern)).toBe(false)
    expect(Globs.match('lib/index.ts', pattern)).toBe(false)
  })

  test('should match brace expansion patterns', () => {
    const pattern = Globs.fromString('*.{js,ts}')

    expect(Globs.match('file.js', pattern)).toBe(true)
    expect(Globs.match('file.ts', pattern)).toBe(true)
    expect(Globs.match('file.css', pattern)).toBe(false)
    expect(Globs.match('file.jsx', pattern)).toBe(false)
  })

  test('should match character class patterns', () => {
    const pattern = Globs.fromString('[a-c]*.txt')

    expect(Globs.match('afile.txt', pattern)).toBe(true)
    expect(Globs.match('bfile.txt', pattern)).toBe(true)
    expect(Globs.match('cfile.txt', pattern)).toBe(true)
    expect(Globs.match('dfile.txt', pattern)).toBe(false)
    expect(Globs.match('zfile.txt', pattern)).toBe(false)
  })

  test('should handle negation patterns', () => {
    const pattern = Globs.fromString('!*.log')

    expect(Globs.match('file.txt', pattern)).toBe(true)
    expect(Globs.match('script.js', pattern)).toBe(true)
    expect(Globs.match('debug.log', pattern)).toBe(false)
    expect(Globs.match('error.log', pattern)).toBe(false)
  })

  test('should be case-sensitive', () => {
    const pattern = Globs.fromString('*.JS')

    expect(Globs.match('file.JS', pattern)).toBe(true)
    expect(Globs.match('file.js', pattern)).toBe(false)
  })

  test('should handle complex nested patterns', () => {
    const pattern = Globs.fromString('src/**/*.{[jt]s,json}')

    expect(Globs.match('src/index.js', pattern)).toBe(true)
    expect(Globs.match('src/types.ts', pattern)).toBe(true)
    expect(Globs.match('src/config.json', pattern)).toBe(true)
    expect(Globs.match('src/deep/nested/file.js', pattern)).toBe(true)
    expect(Globs.match('src/file.css', pattern)).toBe(false)
    expect(Globs.match('lib/index.js', pattern)).toBe(false)
  })
})

describe('Glob.anyMatch', () => {
  test('should return true if any pattern matches', () => {
    const patterns = [Globs.fromString('*.js'), Globs.fromString('*.ts'), Globs.fromString('*.json')]

    expect(Globs.anyMatch('file.js', patterns)).toBe(true)
    expect(Globs.anyMatch('file.ts', patterns)).toBe(true)
    expect(Globs.anyMatch('config.json', patterns)).toBe(true)
    expect(Globs.anyMatch('style.css', patterns)).toBe(false)
  })

  test('should return false if no patterns match', () => {
    const patterns = [Globs.fromString('*.js'), Globs.fromString('*.ts')]

    expect(Globs.anyMatch('style.css', patterns)).toBe(false)
    expect(Globs.anyMatch('image.png', patterns)).toBe(false)
    expect(Globs.anyMatch('document.pdf', patterns)).toBe(false)
  })

  test('should return false for empty pattern array', () => {
    expect(Globs.anyMatch('file.js', [])).toBe(false)
    expect(Globs.anyMatch('anything', [])).toBe(false)
  })

  test('should handle complex pattern combinations', () => {
    const patterns = [Globs.fromString('src/**/*.{js,ts}'), Globs.fromString('test/**/*.spec.*'), Globs.fromString('*.config.json')]

    expect(Globs.anyMatch('src/index.js', patterns)).toBe(true)
    expect(Globs.anyMatch('src/utils/helper.ts', patterns)).toBe(true)
    expect(Globs.anyMatch('test/unit.spec.js', patterns)).toBe(true)
    expect(Globs.anyMatch('webpack.config.json', patterns)).toBe(true)
    expect(Globs.anyMatch('docs/readme.md', patterns)).toBe(false)
  })

  test('should match on first matching pattern', () => {
    const patterns = [
      Globs.fromString('*.js'), // This should match first
      Globs.fromString('file.*'), // This would also match but shouldn't be checked
    ]

    expect(Globs.anyMatch('file.js', patterns)).toBe(true)
  })
})
