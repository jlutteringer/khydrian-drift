import { TypePaths } from '@bessemer/cornerstone'

describe('TypePaths.fromString', () => {
  test('should parse empty string', () => {
    const result = TypePaths.fromString('')
    expect(result).toEqual([])
  })

  test('should parse single property name', () => {
    const result = TypePaths.fromString('store')
    expect(result).toEqual(['store'])
  })

  test('should parse single property name index-style', () => {
    const result = TypePaths.fromString('1')
    expect(result).toEqual(['1'])
  })

  test('should parse property with wildcard', () => {
    const result = TypePaths.fromString('store.*')
    expect(result).toEqual(['store', '*'])
  })

  test('should parse nested property path', () => {
    const result = TypePaths.fromString('store.books.category')
    expect(result).toEqual(['store', 'books', 'category'])
  })

  test('should parse array wildcard access', () => {
    const result = TypePaths.fromString('store.books[*]')
    expect(result).toEqual(['store', 'books', ['*']])
  })

  test('should parse array wildcard with property', () => {
    const result = TypePaths.fromString('store.books[*].category')
    expect(result).toEqual(['store', 'books', ['*'], 'category'])
  })

  test('should parse single array index', () => {
    const result = TypePaths.fromString('store.books[1]')
    expect(result).toEqual(['store', 'books', [1]])
  })

  test('should parse name-style index', () => {
    const result = TypePaths.fromString('store.books.1')
    expect(result).toEqual(['store', 'books', '1'])
  })

  test('should parse array index with property', () => {
    const result = TypePaths.fromString('store.books[1].title')
    expect(result).toEqual(['store', 'books', [1], 'title'])
  })

  test('should parse multiple array indices', () => {
    const result = TypePaths.fromString('store.books[1, 2, 3]')
    expect(result).toEqual(['store', 'books', [1, 2, 3]])
  })

  test('should parse multiple array indices with spaces', () => {
    const result = TypePaths.fromString('store.books[1, 2, 3]')
    expect(result).toEqual(['store', 'books', [1, 2, 3]])
  })

  test('should parse array access at root', () => {
    const result = TypePaths.fromString('[*]')
    expect(result).toEqual([['*']])
  })

  test('should parse array index at root', () => {
    const result = TypePaths.fromString('[1]')
    expect(result).toEqual([[1]])
  })

  test('should parse array at root with property', () => {
    const result = TypePaths.fromString('[*].title')
    expect(result).toEqual([['*'], 'title'])
  })

  test('should parse complex nested path', () => {
    const result = TypePaths.fromString('store.books[*].isbn.number')
    expect(result).toEqual(['store', 'books', ['*'], 'isbn', 'number'])
  })

  test('should parse property names with underscores', () => {
    const result = TypePaths.fromString('user_data.profile_info')
    expect(result).toEqual(['user_data', 'profile_info'])
  })

  test('should parse property names with dollar signs', () => {
    const result = TypePaths.fromString('$root.$config')
    expect(result).toEqual(['$root', '$config'])
  })

  test('should parse property names starting with underscore', () => {
    const result = TypePaths.fromString('_private._internal')
    expect(result).toEqual(['_private', '_internal'])
  })

  test('should parse mixed special characters', () => {
    const result = TypePaths.fromString('_private.$special.user_data')
    expect(result).toEqual(['_private', '$special', 'user_data'])
  })

  test('should parse property names with numbers', () => {
    const result = TypePaths.fromString('user1.data2.field3')
    expect(result).toEqual(['user1', 'data2', 'field3'])
  })

  test('should parse zero array index', () => {
    const result = TypePaths.fromString('items[0]')
    expect(result).toEqual(['items', [0]])
  })

  test('should parse large array indices', () => {
    const result = TypePaths.fromString('items[999].data[1234]')
    expect(result).toEqual(['items', [999], 'data', [1234]])
  })

  test('should throw on mixed wildcard and indices in array', () => {
    expect(() => TypePaths.fromString('items[*, 1, 2]')).toThrow()
  })

  test('should parse nested array access', () => {
    const result = TypePaths.fromString('matrix[0][1]')
    expect(result).toEqual(['matrix', [0], [1]])
  })

  test('should parse deeply nested path with arrays', () => {
    const result = TypePaths.fromString('data.items[0].tags[*].name')
    expect(result).toEqual(['data', 'items', [0], 'tags', ['*'], 'name'])
  })

  test('should throw for invalid syntax - consecutive dots', () => {
    expect(() => TypePaths.fromString('store..books')).toThrow()
  })

  test('should throw for invalid syntax - starting with dot', () => {
    expect(() => TypePaths.fromString('.store')).toThrow()
  })

  test('should throw for invalid syntax - ending with dot', () => {
    expect(() => TypePaths.fromString('store.')).toThrow()
  })

  test('should throw for invalid syntax - unmatched brackets', () => {
    expect(() => TypePaths.fromString('store.books[')).toThrow()
  })

  test('should throw for invalid syntax - empty brackets', () => {
    expect(() => TypePaths.fromString('store.books[]')).toThrow()
  })

  test('should throw for invalid syntax - starting with number', () => {
    expect(() => TypePaths.fromString('123invalid')).toThrow()
  })

  test('should throw for invalid syntax - invalid characters', () => {
    expect(() => TypePaths.fromString('store.books@invalid')).toThrow()
  })

  test('should handle very long property names', () => {
    const longName = 'a'.repeat(100)
    const result = TypePaths.fromString(`${longName}.${longName}`)
    expect(result).toEqual([longName, longName])
  })

  test('should parse complex real-world example', () => {
    const result = TypePaths.fromString('api.responses[0].data.users[*].profile.settings.preferences[1, 3, 5]')
    expect(result).toEqual(['api', 'responses', [0], 'data', 'users', ['*'], 'profile', 'settings', 'preferences', [1, 3, 5]])
  })
})
