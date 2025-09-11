import { ObjectPaths, TypePaths } from '@bessemer/cornerstone'
import { expectTypeOf } from 'expect-type'
import { IndexSelectorType, NameSelectorType, ParseObjectPath } from '@bessemer/cornerstone/object/type-path-type'
import { ObjectPath } from '@bessemer/cornerstone/object/object-path'

describe('ObjectPaths.fromString', () => {
  test('should parse empty string', () => {
    const result = ObjectPaths.fromString('')
    expectTypeOf(result).toEqualTypeOf<ObjectPath<[]>>()
    expect(result).toEqual([])
  })

  test('should parse single property name', () => {
    const result = ObjectPaths.fromString('store')
    expectTypeOf(result).toEqualTypeOf<ObjectPath<[NameSelectorType<'store'>]>>()
    expect(result).toEqual(['store'])
  })

  test('should parse single property name index-style', () => {
    const result = ObjectPaths.fromString('1')
    expectTypeOf(result).toEqualTypeOf<ObjectPath<[NameSelectorType<'1'>]>>()
    expect(result).toEqual(['1'])
  })

  test('should throw with wildcard', () => {
    expect(() => ObjectPaths.fromString('store.*')).toThrow()
    expectTypeOf<ObjectPath<ParseObjectPath<'store.*'>>>().toEqualTypeOf<ObjectPath<[NameSelectorType<'store'>, never]>>()
  })

  test('should parse nested property path', () => {
    const result = ObjectPaths.fromString('store.books.category')
    expectTypeOf(result).toEqualTypeOf<ObjectPath<[NameSelectorType<'store'>, NameSelectorType<'books'>, NameSelectorType<'category'>]>>()
    expect(result).toEqual(['store', 'books', 'category'])
  })

  test('should throw with array wildcard access', () => {
    expect(() => ObjectPaths.fromString('store.books[*]')).toThrow()
    expectTypeOf<ObjectPath<ParseObjectPath<'store.books[*]'>>>().toEqualTypeOf<
      ObjectPath<[NameSelectorType<'store'>, NameSelectorType<'books'>, never]>
    >()
  })

  test('should throw with array wildcard with property', () => {
    expect(() => ObjectPaths.fromString('store.books[*].category')).toThrow()
    type Type = ObjectPath<ParseObjectPath<'store.books[*].category'>>
    expectTypeOf<Type>().toEqualTypeOf<ObjectPath<[NameSelectorType<'store'>, NameSelectorType<'books'>, never, NameSelectorType<'category'>]>>()
  })

  test('should parse single array index', () => {
    const result = ObjectPaths.fromString('store.books[1]')
    expectTypeOf(result).toEqualTypeOf<ObjectPath<[NameSelectorType<'store'>, NameSelectorType<'books'>, [IndexSelectorType<1>]]>>()
    expect(result).toEqual(['store', 'books', [1]])
  })

  test('should parse name-style index', () => {
    const result = ObjectPaths.fromString('store.books.1')
    expectTypeOf(result).toEqualTypeOf<ObjectPath<[NameSelectorType<'store'>, NameSelectorType<'books'>, NameSelectorType<'1'>]>>()
    expect(result).toEqual(['store', 'books', '1'])
  })

  test('should parse array index with property', () => {
    const result = ObjectPaths.fromString('store.books[1].title')
    expectTypeOf(result).toEqualTypeOf<
      ObjectPath<[NameSelectorType<'store'>, NameSelectorType<'books'>, [IndexSelectorType<1>], NameSelectorType<'title'>]>
    >()
    expect(result).toEqual(['store', 'books', [1], 'title'])
  })

  test('should throw with multiple array indices', () => {
    expectTypeOf<ObjectPath<ParseObjectPath<'store.books[2,3,4]'>>>().toEqualTypeOf<
      ObjectPath<[NameSelectorType<'store'>, NameSelectorType<'books'>, never]>
    >()
    expect(() => ObjectPaths.fromString('store.books[2,3,4]')).toThrow()
  })

  test('should parse array index at root', () => {
    const result = ObjectPaths.fromString('[1]')
    expectTypeOf(result).toEqualTypeOf<ObjectPath<[[IndexSelectorType<1>]]>>()
    expect(result).toEqual([[1]])
  })

  test('should throw with wildcard path *', () => {
    expectTypeOf<ObjectPath<ParseObjectPath<'*'>>>().toEqualTypeOf<ObjectPath<[never]>>()
    expect(() => ObjectPaths.fromString('*')).toThrow()
  })

  test('should throw with wildcard path [*]', () => {
    expectTypeOf<ObjectPath<ParseObjectPath<'[*]'>>>().toEqualTypeOf<ObjectPath<[never]>>()
    expect(() => ObjectPaths.fromString('[*]')).toThrow()
  })

  test('should throw with complex wildcard path', () => {
    expectTypeOf<ObjectPath<ParseObjectPath<'store.books[*].isbn.number'>>>().toEqualTypeOf<
      ObjectPath<[NameSelectorType<'store'>, NameSelectorType<'books'>, never, NameSelectorType<'isbn'>, NameSelectorType<'number'>]>
    >()
    expect(() => ObjectPaths.fromString('store.books[*].isbn.number')).toThrow()
  })
})

describe('ObjectPaths.applyValue', () => {
  test('should set simple property value', () => {
    const obj = { name: 'John', age: 30 }

    const result = ObjectPaths.applyValue(ObjectPaths.fromString('name'), obj, 'Jane')

    expect(result).toEqual({ name: 'Jane', age: 30 })
    expect(obj.name).toBe('John') // original unchanged
  })

  test('should set nested property value', () => {
    const obj = { user: { profile: { name: 'Alice' } } }

    const result = ObjectPaths.applyValue(ObjectPaths.fromString('user.profile.name'), obj, 'Bob')

    expect(result).toEqual({ user: { profile: { name: 'Bob' } } })
    expect(obj.user.profile.name).toBe('Alice') // original unchanged
  })

  test('should set array element by index', () => {
    const obj = { users: ['Alice', 'Bob', 'Charlie'] }

    const result = ObjectPaths.applyValue(ObjectPaths.fromString('users[1]'), obj, 'Bobby')

    expect(result).toEqual({ users: ['Alice', 'Bobby', 'Charlie'] })
    expect(obj.users[1]).toBe('Bob') // original unchanged
  })

  test('should set nested array element', () => {
    const obj = {
      data: {
        items: [{ name: 'Item 1' }, { name: 'Item 2' }],
      },
    }

    const result = ObjectPaths.applyAnyValue(ObjectPaths.fromString('data.items.0.name'), obj, 'Updated Item')

    expect(result).toEqual({
      data: {
        items: [{ name: 'Updated Item' }, { name: 'Item 2' }],
      },
    })
    expect(obj.data.items[0]?.name).toBe('Item 1') // original unchanged
  })

  test('should set value in multidimensional array', () => {
    const obj = {
      matrix: [
        [1, 2, 3],
        [4, 5, 6],
      ],
    } as const

    const result = ObjectPaths.applyAnyValue(ObjectPaths.fromString('matrix.1.2'), obj, 99)

    expect(result).toEqual({
      matrix: [
        [1, 2, 3],
        [4, 5, 99],
      ],
    })
    expect(obj.matrix[1][2]).toBe(6) // original unchanged
  })

  test('should create new property', () => {
    const obj = { name: 'John' }

    const result = ObjectPaths.applyAnyValue(ObjectPaths.fromString('age'), obj, 30)

    expect(result).toEqual({ name: 'John', age: 30 })
    expect(obj).not.toHaveProperty('age') // original unchanged
  })

  test('should NOT handle complex nested path creation and throw instead', () => {
    const obj = { user: { profile: { name: 'Alice' } } }
    expect(() => ObjectPaths.applyAnyValue(ObjectPaths.fromString('user.settings.theme'), obj, 'dark')).toThrow()
  })

  test('should set null value', () => {
    const obj = { name: 'John', age: 30 }

    const result = ObjectPaths.applyAnyValue(ObjectPaths.fromString('age'), obj, null)

    expect(result).toEqual({ name: 'John', age: null })
  })

  test('should set undefined value', () => {
    const obj = { name: 'John', age: 30 }

    const result = ObjectPaths.applyValue(ObjectPaths.fromString('age'), obj, undefined)

    expect(result).toEqual({ name: 'John', age: undefined })
  })

  test('should handle object replacement', () => {
    const obj = { user: { name: 'John', age: 30 } }
    const newUser = { name: 'Jane', role: 'admin' }

    const result = ObjectPaths.applyAnyValue(ObjectPaths.fromString('user'), obj, newUser)

    expect(result).toEqual({ user: { name: 'Jane', role: 'admin' } })
  })

  test('should handle array replacement', () => {
    const obj = { items: [1, 2, 3] }
    const newItems = ['a', 'b', 'c']

    const result = ObjectPaths.applyAnyValue(ObjectPaths.fromString('items'), obj, newItems)

    expect(result).toEqual({ items: ['a', 'b', 'c'] })
  })

  test('should maintain immutability for nested objects', () => {
    const obj = {
      user: { profile: { name: 'Alice' } },
      settings: { theme: 'light' },
    }

    const result: any = ObjectPaths.applyValue(ObjectPaths.fromString('user.profile.name'), obj, 'Bob')

    expect(result).not.toBe(obj)
    expect(result.user).not.toBe(obj.user)
    expect(result.user.profile).not.toBe(obj.user.profile)
    expect(result.settings).toBe(obj.settings)
  })

  test('should handle setting values in sparse arrays', () => {
    const obj = { items: [1, undefined, 3] }

    const result = ObjectPaths.applyValue(ObjectPaths.fromString('items[1]'), obj, 2)

    expect(result).toEqual({ items: [1, 2, 3] })
  })
})

describe('ObjectPaths.intersect', () => {
  test('should intersect matching simple property path', () => {
    const objectPath = ObjectPaths.fromString('store.books')
    const typePath = TypePaths.fromString('store.books')
    const result = ObjectPaths.intersect(objectPath, typePath)
    expect(result).toEqual(['store', 'books'])
  })

  test('should intersect when ObjectPath is longer than TypePath', () => {
    const objectPath = ObjectPaths.fromString('store.books.category')
    const typePath = TypePaths.fromString('store.books')
    const result = ObjectPaths.intersect(objectPath, typePath)
    expect(result).toEqual(['store', 'books'])
  })

  test('should throw when TypePath is longer than ObjectPath', () => {
    const objectPath = ObjectPaths.fromString('store.books')
    const typePath = TypePaths.fromString('store.books.category')
    expect(() => ObjectPaths.intersect(objectPath, typePath)).toThrow()
  })

  test('should handle empty paths', () => {
    const objectPath = ObjectPaths.fromString('')
    const typePath = TypePaths.fromString('')
    const result = ObjectPaths.intersect(objectPath, typePath)
    expect(result).toEqual([])
  })

  test('should handle wildcard selector in TypePath', () => {
    const objectPath = ObjectPaths.fromString('store.books')
    const typePath = TypePaths.fromString('store.*')
    const result = ObjectPaths.intersect(objectPath, typePath)
    expect(result).toEqual(['store', 'books'])
  })

  test('should handle array index matching TypePath array selector', () => {
    const objectPath = ObjectPaths.fromString('store.books[1]')
    const typePath = TypePaths.fromString('store.books[0,1,2]')
    const result = ObjectPaths.intersect(objectPath, typePath)
    expect(result).toEqual(['store', 'books', [1]])
  })

  test('should throw when array index does not match TypePath array selector', () => {
    const objectPath = ObjectPaths.fromString('store.books[5]')
    const typePath = TypePaths.fromString('store.books[0,1,2]')
    expect(() => ObjectPaths.intersect(objectPath, typePath)).toThrow()
  })

  test('should handle name-style index matching TypePath array selector', () => {
    const objectPath = ObjectPaths.fromString('store.books.1')
    const typePath = TypePaths.fromString('store.books[0,1,2]')
    const result = ObjectPaths.intersect(objectPath, typePath)
    expect(result).toEqual(['store', 'books', '1'])
  })

  test('should throw when name-style index does not match TypePath array selector', () => {
    const objectPath = ObjectPaths.fromString('store.books.5')
    const typePath = TypePaths.fromString('store.books[0,1,2]')
    expect(() => ObjectPaths.intersect(objectPath, typePath)).toThrow()
  })

  test('should handle array selector in ObjectPath matching string selector in TypePath', () => {
    const objectPath = ObjectPaths.fromString('store[1]')
    const typePath = TypePaths.fromString('store.1')
    const result = ObjectPaths.intersect(objectPath, typePath)
    expect(result).toEqual(['store', [1]])
  })

  test('should throw when array selector in ObjectPath does not match string selector in TypePath', () => {
    const objectPath = ObjectPaths.fromString('store[2]')
    const typePath = TypePaths.fromString('store.1')
    expect(() => ObjectPaths.intersect(objectPath, typePath)).toThrow()
  })

  test('should handle string selector matching in both paths', () => {
    const objectPath = ObjectPaths.fromString('store.books.category')
    const typePath = TypePaths.fromString('store.books.category')
    const result = ObjectPaths.intersect(objectPath, typePath)
    expect(result).toEqual(['store', 'books', 'category'])
  })

  test('should throw when string selectors do not match', () => {
    const objectPath = ObjectPaths.fromString('store.books.title')
    const typePath = TypePaths.fromString('store.books.category')
    expect(() => ObjectPaths.intersect(objectPath, typePath)).toThrow()
  })

  test('should handle complex path with mixed selectors and wildcards', () => {
    const objectPath = ObjectPaths.fromString('store.books[2].title')
    const typePath = TypePaths.fromString('store.books.*')
    const result = ObjectPaths.intersect(objectPath, typePath)
    expect(result).toEqual(['store', 'books', [2]])
  })

  test('should handle wildcard array selector in TypePath', () => {
    const objectPath = ObjectPaths.fromString('store.books[2]')
    const typePath = TypePaths.fromString('store.books[*]')
    const result = ObjectPaths.intersect(objectPath, typePath)
    expect(result).toEqual(['store', 'books', [2]])
  })

  test('should return early when TypePath is shorter than ObjectPath', () => {
    const objectPath = ObjectPaths.fromString('a.b.c.d.e')
    const typePath = TypePaths.fromString('a.b')
    const result = ObjectPaths.intersect(objectPath, typePath)
    expect(result).toEqual(['a', 'b'])
  })

  test('should handle root array access', () => {
    const objectPath = ObjectPaths.fromString('[0]')
    const typePath = TypePaths.fromString('[*]')
    const result = ObjectPaths.intersect(objectPath, typePath)
    expect(result).toEqual([[0]])
  })

  test('should handle root array access with specific index', () => {
    const objectPath = ObjectPaths.fromString('[1]')
    const typePath = TypePaths.fromString('[0,1,2]')
    const result = ObjectPaths.intersect(objectPath, typePath)
    expect(result).toEqual([[1]])
  })

  test('should throw when root array access does not match', () => {
    const objectPath = ObjectPaths.fromString('[5]')
    const typePath = TypePaths.fromString('[0,1,2]')
    expect(() => ObjectPaths.intersect(objectPath, typePath)).toThrow()
  })
})
