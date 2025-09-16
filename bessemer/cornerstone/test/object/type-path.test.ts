import { TypePaths } from '@bessemer/cornerstone'
import { expectTypeOf } from 'expect-type'
import { TypePath } from '@bessemer/cornerstone/object/type-path'
import { IndexSelectorType, NameSelectorType, TypePathParse, WildcardSelectorType } from '@bessemer/cornerstone/object/type-path-type'
import { WritableDeep } from 'type-fest'

enum BookCategory {
  Reference = 'Reference',
  Fiction = 'Fiction',
  NonFiction = 'NonFiction',
}

type TestDataType = Array<{
  name: string
  store: {
    books: Array<{
      category: BookCategory
      author: string
      title: string
      price: number
      isbn?: {
        name: string
        number: string
      }
      publisher:
        | {
            name: string
            credits: Array<{ id: number; name: string }>
          }
        | {
            name: number
          }
        | null
    }>
    bicycle: {
      color: string
      price: number
    }
    advertisement: { title: string; value: number } | null
    additionalAdvertisement?: { title: string; value: number } | null
  }
  matrix: Array<Array<{ category: string; author: string; title: string; price: number }>>
  employees: Array<string>
}>

const TestData: TestDataType = [
  {
    name: 'Books A Million',
    store: {
      books: [
        {
          category: BookCategory.Reference,
          author: 'Nigel Rees',
          title: 'Sayings of the Century',
          price: 8.95,
          publisher: null,
        },
        {
          category: BookCategory.Fiction,
          author: 'Evelyn Waugh',
          title: 'Sword of Honour',
          price: 12.99,
          publisher: {
            name: 'John Publisher',
            credits: [
              { id: 1234, name: 'First Credit' },
              { id: 4567, name: 'Second Credit' },
            ],
          },
        },
        {
          category: BookCategory.Fiction,
          author: 'Herman Melville',
          title: 'Moby Dick',
          isbn: {
            name: 'John Library',
            number: '0-553-21311-3',
          },
          price: 8.99,
          publisher: null,
        },
        {
          category: BookCategory.Fiction,
          author: 'J. R. R. Tolkien',
          title: 'The Lord of the Rings',
          isbn: {
            name: 'The Other Library',
            number: '0-395-19395-8',
          },
          price: 22.99,
          publisher: {
            name: 1234,
          },
        },
      ],
      bicycle: {
        color: 'red',
        price: 399,
      },
      advertisement: null,
    },
    employees: ['John', 'Joanne'],
    matrix: [
      [
        { category: 'reference', author: 'Nigel Rees', title: 'Sayings of the Century', price: 8.95 },
        { category: 'fiction', author: 'Evelyn Waugh', title: 'Sword of Honour', price: 12.99 },
      ],
      [
        { category: 'fiction', author: 'Herman Melville', title: 'Moby Dick', price: 8.99 },
        { category: 'fiction', author: 'J. R. R. Tolkien', title: 'The Lord of the Rings', price: 22.99 },
      ],
    ],
  },
  {
    name: 'Amazon',
    store: {
      books: [
        {
          category: BookCategory.NonFiction,
          author: 'Walter Monte',
          title: 'A History of Everything',
          price: 895,
          publisher: {
            name: 'John Publisher',
            credits: [
              { id: 1234, name: 'First Credit' },
              { id: 4567, name: 'Second Credit' },
            ],
          },
        },
        {
          category: BookCategory.Fiction,
          author: 'Evelyn Fre',
          title: 'An Omage to Omages',
          price: 12.99,
          isbn: {
            name: 'John Library',
            number: '0-553-21311-3',
          },
          publisher: null,
        },
      ],
      bicycle: {
        color: 'red',
        price: 399,
      },
      advertisement: null,
    },
    employees: [],
    matrix: [
      [],
      [
        { category: 'fiction', author: 'Herman Melville', title: 'Moby Dick', price: 8.99 },
        { category: 'fiction', author: 'J. R. R. Tolkien', title: 'The Lord of the Rings', price: 22.99 },
      ],
    ],
  },
]

const TestObject = TestData[0]!
export type TestObjectType = typeof TestObject

const TestDataConst = [
  {
    name: 'Books A Million',
    store: {
      books: [
        {
          category: BookCategory.Reference,
          author: 'Nigel Rees',
          title: 'Sayings of the Century',
          price: 8.95,
          publisher: null,
        },
        {
          category: BookCategory.Fiction,
          author: 'Evelyn Waugh',
          title: 'Sword of Honour',
          price: 12.99,
          publisher: {
            name: 'John Publisher',
            credits: [
              { id: 1234, name: 'First Credit' },
              { id: 4567, name: 'Second Credit' },
            ],
          },
        },
        {
          category: BookCategory.Fiction,
          author: 'Herman Melville',
          title: 'Moby Dick',
          isbn: {
            name: 'John Library',
            number: '0-553-21311-3',
          },
          price: 8.99,
          publisher: null,
        },
        {
          category: BookCategory.Fiction,
          author: 'J. R. R. Tolkien',
          title: 'The Lord of the Rings',
          isbn: {
            name: 'The Other Library',
            number: '0-395-19395-8',
          },
          price: 22.99,
          publisher: {
            name: 1234,
          },
        },
      ],
      bicycle: {
        color: 'red',
        price: 399,
      },
      advertisement: null,
    },
    employees: ['John', 'Joanne'],
    matrix: [
      [
        { category: 'reference', author: 'Nigel Rees', title: 'Sayings of the Century', price: 8.95 },
        { category: 'fiction', author: 'Evelyn Waugh', title: 'Sword of Honour', price: 12.99 },
      ],
      [
        { category: 'fiction', author: 'Herman Melville', title: 'Moby Dick', price: 8.99 },
        { category: 'fiction', author: 'J. R. R. Tolkien', title: 'The Lord of the Rings', price: 22.99 },
      ],
    ],
  },
  {
    name: 'Amazon',
    store: {
      books: [
        {
          category: BookCategory.NonFiction,
          author: 'Walter Monte',
          title: 'A History of Everything',
          price: 895,
          publisher: {
            name: 'John Publisher',
            credits: [
              { id: 1234, name: 'First Credit' },
              { id: 4567, name: 'Second Credit' },
            ],
          },
        },
        {
          category: BookCategory.Fiction,
          author: 'Evelyn Fre',
          title: 'An Omage to Omages',
          price: 12.99,
          isbn: {
            name: 'John Library',
            number: '0-553-21311-3',
          },
          publisher: null,
        },
      ],
      bicycle: {
        color: 'red',
        price: 399,
      },
      advertisement: null,
    },
    employees: [],
    matrix: [
      [],
      [
        { category: 'fiction', author: 'Herman Melville', title: 'Moby Dick', price: 8.99 },
        { category: 'fiction', author: 'J. R. R. Tolkien', title: 'The Lord of the Rings', price: 22.99 },
      ],
    ],
  },
] as const

// JOHN the parsing voodoo doesn't work with readonly types :(
type TestDataConstType = WritableDeep<typeof TestDataConst>
const TestObjectConst = TestDataConst[0] as WritableDeep<typeof TestDataConst[0]>
type TestObjectConstType = WritableDeep<typeof TestObjectConst>

describe('TypePaths.fromString', () => {
  test('should parse empty string', () => {
    const result = TypePaths.fromString('')
    expectTypeOf(result).toEqualTypeOf<TypePath<[]>>()
    expect(result).toEqual([])
  })

  test('should parse single property name', () => {
    const result = TypePaths.fromString('store')
    expectTypeOf(result).toEqualTypeOf<TypePath<[NameSelectorType<'store'>]>>()
    expect(result).toEqual(['store'])
  })

  test('should parse single property name index-style', () => {
    const result = TypePaths.fromString('1')
    expectTypeOf(result).toEqualTypeOf<TypePath<[NameSelectorType<'1'>]>>()
    expect(result).toEqual(['1'])
  })

  test('should parse property with wildcard', () => {
    const result = TypePaths.fromString('store.*')
    expectTypeOf(result).toEqualTypeOf<TypePath<[NameSelectorType<'store'>, WildcardSelectorType]>>()
    expect(result).toEqual(['store', '*'])
  })

  test('should parse nested property path', () => {
    const result = TypePaths.fromString('store.books.category')
    expectTypeOf(result).toEqualTypeOf<TypePath<[NameSelectorType<'store'>, NameSelectorType<'books'>, NameSelectorType<'category'>]>>()
    expect(result).toEqual(['store', 'books', 'category'])
  })

  test('should parse array wildcard access', () => {
    const result = TypePaths.fromString('store.books[*]')
    expectTypeOf(result).toEqualTypeOf<TypePath<[NameSelectorType<'store'>, NameSelectorType<'books'>, WildcardSelectorType]>>()
    expect(result).toEqual(['store', 'books', '*'])
  })

  test('should parse array wildcard with property', () => {
    const result = TypePaths.fromString('store.books[*].category')
    expectTypeOf(result).toEqualTypeOf<
      TypePath<[NameSelectorType<'store'>, NameSelectorType<'books'>, WildcardSelectorType, NameSelectorType<'category'>]>
    >()
    expect(result).toEqual(['store', 'books', '*', 'category'])
  })

  test('should parse single array index', () => {
    const result = TypePaths.fromString('store.books[1]')
    expectTypeOf(result).toEqualTypeOf<TypePath<[NameSelectorType<'store'>, NameSelectorType<'books'>, [IndexSelectorType<1>]]>>()
    expect(result).toEqual(['store', 'books', [1]])
  })

  test('should parse name-style index', () => {
    const result = TypePaths.fromString('store.books.1')
    expectTypeOf(result).toEqualTypeOf<TypePath<[NameSelectorType<'store'>, NameSelectorType<'books'>, NameSelectorType<'1'>]>>()
    expect(result).toEqual(['store', 'books', '1'])
  })

  test('should parse array index with property', () => {
    const result = TypePaths.fromString('store.books[1].title')
    expectTypeOf(result).toEqualTypeOf<
      TypePath<[NameSelectorType<'store'>, NameSelectorType<'books'>, [IndexSelectorType<1>], NameSelectorType<'title'>]>
    >()
    expect(result).toEqual(['store', 'books', [1], 'title'])
  })

  test('should parse multiple array indices - no whitespace', () => {
    const result = TypePaths.fromString('store.books[2,3,4]')
    expectTypeOf(result).toEqualTypeOf<
      TypePath<[NameSelectorType<'store'>, NameSelectorType<'books'>, [IndexSelectorType<2>, IndexSelectorType<3>, IndexSelectorType<4>]]>
    >()
    expect(result).toEqual(['store', 'books', [2, 3, 4]])
  })

  test('should parse multiple array indices - whitespace', () => {
    const result = TypePaths.fromString('store.books[1, 2, 3]')
    // JOHN we lose typechecking in subsequent arrays - should we even allow whitespace like this in the query language?
    expectTypeOf(result).toEqualTypeOf<
      TypePath<[NameSelectorType<'store'>, NameSelectorType<'books'>, [IndexSelectorType<1>, IndexSelectorType<number>, IndexSelectorType<number>]]>
    >()
    expect(result).toEqual(['store', 'books', [1, 2, 3]])
  })

  test('should parse multiple array indices - more whitespace', () => {
    const result = TypePaths.fromString('store.books[  1, 2  , 3 ]')
    // JOHN we lose typechecking in subsequent arrays - should we even allow whitespace like this in the query language?
    expectTypeOf(result).toEqualTypeOf<
      TypePath<
        [NameSelectorType<'store'>, NameSelectorType<'books'>, [IndexSelectorType<number>, IndexSelectorType<number>, IndexSelectorType<number>]]
      >
    >()
    expect(result).toEqual(['store', 'books', [1, 2, 3]])
  })

  test('should parse array access at root', () => {
    const result = TypePaths.fromString('[*]')
    expectTypeOf(result).toEqualTypeOf<TypePath<[WildcardSelectorType]>>()
    expect(result).toEqual(['*'])
  })

  test('should parse array index at root', () => {
    const result = TypePaths.fromString('[1]')
    expectTypeOf(result).toEqualTypeOf<TypePath<[[IndexSelectorType<1>]]>>()
    expect(result).toEqual([[1]])
  })

  test('should parse array at root with property', () => {
    const result = TypePaths.fromString('[*].title')
    expectTypeOf(result).toEqualTypeOf<TypePath<[WildcardSelectorType, NameSelectorType<'title'>]>>()
    expect(result).toEqual(['*', 'title'])
  })

  test('should parse complex nested path', () => {
    const result = TypePaths.fromString('store.books[*].isbn.number')
    expectTypeOf(result).toEqualTypeOf<
      TypePath<[NameSelectorType<'store'>, NameSelectorType<'books'>, WildcardSelectorType, NameSelectorType<'isbn'>, NameSelectorType<'number'>]>
    >()
    expect(result).toEqual(['store', 'books', '*', 'isbn', 'number'])
  })

  test('should parse property names with underscores', () => {
    const result = TypePaths.fromString('user_data.profile_info')
    expectTypeOf(result).toEqualTypeOf<TypePath<[NameSelectorType<'user_data'>, NameSelectorType<'profile_info'>]>>()
    expect(result).toEqual(['user_data', 'profile_info'])
  })

  test('should parse property names with dollar signs', () => {
    const result = TypePaths.fromString('$root.$config')
    expectTypeOf(result).toEqualTypeOf<TypePath<[NameSelectorType<'$root'>, NameSelectorType<'$config'>]>>()
    expect(result).toEqual(['$root', '$config'])
  })

  test('should parse property names starting with underscore', () => {
    const result = TypePaths.fromString('_private._internal')
    expectTypeOf(result).toEqualTypeOf<TypePath<[NameSelectorType<'_private'>, NameSelectorType<'_internal'>]>>()
    expect(result).toEqual(['_private', '_internal'])
  })

  test('should parse mixed special characters', () => {
    const result = TypePaths.fromString('_private.$special.user_data')
    expectTypeOf(result).toEqualTypeOf<TypePath<[NameSelectorType<'_private'>, NameSelectorType<'$special'>, NameSelectorType<'user_data'>]>>()
    expect(result).toEqual(['_private', '$special', 'user_data'])
  })

  test('should parse property names with numbers', () => {
    const result = TypePaths.fromString('user1.data2.field3')
    expectTypeOf(result).toEqualTypeOf<TypePath<[NameSelectorType<'user1'>, NameSelectorType<'data2'>, NameSelectorType<'field3'>]>>()
    expect(result).toEqual(['user1', 'data2', 'field3'])
  })

  test('should parse zero array index', () => {
    const result = TypePaths.fromString('items[0]')
    expectTypeOf(result).toEqualTypeOf<TypePath<[NameSelectorType<'items'>, [IndexSelectorType<0>]]>>()
    expect(result).toEqual(['items', [0]])
  })

  test('should parse large array indices', () => {
    const result = TypePaths.fromString('items[999].data[1234]')
    expectTypeOf(result).toEqualTypeOf<
      TypePath<[NameSelectorType<'items'>, [IndexSelectorType<999>], NameSelectorType<'data'>, [IndexSelectorType<1234>]]>
    >()
    expect(result).toEqual(['items', [999], 'data', [1234]])
  })

  test('should parse nested array access', () => {
    const result = TypePaths.fromString('matrix[0][1]')
    expectTypeOf(result).toEqualTypeOf<TypePath<[NameSelectorType<'matrix'>, [IndexSelectorType<0>], [IndexSelectorType<1>]]>>()
    expect(result).toEqual(['matrix', [0], [1]])
  })

  test('should parse deeply nested path with arrays', () => {
    const result = TypePaths.fromString('data.items[0].tags[*].name')
    expectTypeOf(result).toEqualTypeOf<
      TypePath<
        [
          NameSelectorType<'data'>,
          NameSelectorType<'items'>,
          [IndexSelectorType<0>],
          NameSelectorType<'tags'>,
          WildcardSelectorType,
          NameSelectorType<'name'>
        ]
      >
    >()
    expect(result).toEqual(['data', 'items', [0], 'tags', '*', 'name'])
  })

  test('should handle very long property names', () => {
    const longName = 'a'.repeat(100)
    const result = TypePaths.fromString(`${longName}.${longName}`)
    expect(result).toEqual([longName, longName])
  })

  test('should parse complex real-world example', () => {
    const result = TypePaths.fromString('api.responses[0].data.users[*].profile.settings.preferences[1,3,5]')
    expectTypeOf(result).toEqualTypeOf<
      TypePath<
        [
          NameSelectorType<'api'>,
          NameSelectorType<'responses'>,
          [IndexSelectorType<0>],
          NameSelectorType<'data'>,
          NameSelectorType<'users'>,
          WildcardSelectorType,
          NameSelectorType<'profile'>,
          NameSelectorType<'settings'>,
          NameSelectorType<'preferences'>,
          [IndexSelectorType<1>, IndexSelectorType<3>, IndexSelectorType<5>]
        ]
      >
    >()
    expect(result).toEqual(['api', 'responses', [0], 'data', 'users', '*', 'profile', 'settings', 'preferences', [1, 3, 5]])
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

  test('should throw on mixed wildcard and indices in array', () => {
    expect(() => TypePaths.fromString('items[*, 1, 2]')).toThrow()
  })
})

describe('TypePaths.getValue', () => {
  {
    const path = ''
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestObject)
      expect(result).toEqual(TestObject)

      type Type = TypePathParse<typeof path, TestObjectType>
      expectTypeOf<Type>().toEqualTypeOf<TestObjectType>()

      type Const = TypePathParse<typeof path, TestObjectConstType>
      expectTypeOf<Const>().toEqualTypeOf<TestObjectConstType>()
    })
  }

  {
    const path = '*'
    test(path, () => {
      // JOHN Wildcard operations on Objects is not yet supported
      // const result = TypePaths.getValue(TypePaths.fromString(path), TestObject)
      // expect(result).toEqual(Object.values(TestObject))

      type Type = TypePathParse<typeof path, TestObjectType>
      expectTypeOf<Type>().toEqualTypeOf(Object.values(TestObject))

      type Const = TypePathParse<typeof path, TestObjectConstType>
      expectTypeOf<Const>().toEqualTypeOf(Object.values(TestObjectConst))
    })
  }

  {
    const path = 'store'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestObject)
      expect(result).toEqual(TestObject.store)

      type Type = TypePathParse<typeof path, TestObjectType>
      expectTypeOf<Type>().toEqualTypeOf(TestObject.store)

      type Const = TypePathParse<typeof path, TestObjectConstType>
      expectTypeOf<Const>().toEqualTypeOf(TestObjectConst.store)
    })
  }

  {
    const path = 'store.books'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestObject)
      expect(result).toEqual(Object.values(TestObject.store.books))

      type Type = TypePathParse<typeof path, TestObjectType>
      expectTypeOf<Type>().toEqualTypeOf(TestObject.store.books)

      type Const = TypePathParse<typeof path, TestObjectConstType>
      expectTypeOf<Const>().toEqualTypeOf(TestObjectConst.store.books)
    })
  }

  {
    const path = 'store.bicycle.*'
    test(path, () => {
      // JOHN Wildcard operations on Objects is not yet supported
      // const result = TypePaths.getValue(TypePaths.fromString(path), TestObject)
      // expect(result).toEqual(Object.values(TestObject.store.bicycle))

      type Type = TypePathParse<typeof path, TestObjectType>
      expectTypeOf<Type>().toEqualTypeOf<Array<string | number>>()

      type Const = TypePathParse<typeof path, TestObjectConstType>
      expectTypeOf<Const>().toEqualTypeOf<Array<'red' | 399>>()
    })
  }

  {
    const path = 'store.books[*]'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestObject)
      expect(result).toEqual(Object.values(TestObject.store.books))

      type Type = TypePathParse<typeof path, TestObjectType>
      expectTypeOf<Type>().toEqualTypeOf(TestObject.store.books)

      type Const = TypePathParse<typeof path, WritableDeep<TestObjectConstType>>
      expectTypeOf<Const>().toEqualTypeOf<typeof TestObjectConst.store.books>()
    })
  }

  {
    const path = 'store.books.*'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestObject)
      expect(result).toEqual(Object.values(TestObject.store.books))

      type Type = TypePathParse<typeof path, TestObjectType>
      expectTypeOf<Type>().toEqualTypeOf(TestObject.store.books)

      type Const = TypePathParse<typeof path, TestObjectConstType>
      expectTypeOf<Const>().toEqualTypeOf(TestObjectConst.store.books)
    })
  }

  {
    const path = 'employees[*]'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestObject)
      expect(result).toEqual(TestObject.employees)

      type Type = TypePathParse<typeof path, TestObjectType>
      expectTypeOf<Type>().toEqualTypeOf(TestObject.employees)

      type Const = TypePathParse<typeof path, TestObjectConstType>
      expectTypeOf<Const>().toEqualTypeOf(TestObjectConst.employees)
    })
  }

  {
    const path = 'employees[1]'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestObject)
      expect(result).toEqual(TestObject.employees[1])

      type Type = TypePathParse<typeof path, TestObjectType>
      expectTypeOf<Type>().toEqualTypeOf(TestObject.employees[1])

      type Const = TypePathParse<typeof path, TestObjectConstType>
      expectTypeOf<Const>().toEqualTypeOf(TestObjectConst.employees[1])
    })
  }

  {
    const path = 'store.books[1]'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestObject)
      expect(result).toEqual(TestObject.store.books[1])

      type Type = TypePathParse<typeof path, TestObjectType>
      expectTypeOf<Type>().toEqualTypeOf(TestObject.store.books[1])

      type Const = TypePathParse<typeof path, TestObjectConstType>
      expectTypeOf<Const>().toEqualTypeOf(TestObjectConst.store.books[1])
    })
  }

  // JOHN
  // {
  //   const path = 'store.books.1'
  //   test(path, () => {
  //     const result = TypePaths.getValue(TypePaths.fromString(path), TestObject)
  //     expect(result).toEqual(TestObject.store.books[1])
  //
  //     type Type = TypePathParse<typeof path, TestObjectType>
  //     expectTypeOf<Type>().toEqualTypeOf(TestObject.store.books[1])
  //
  //     type Const = TypePathParse<typeof path, TestObjectConstType>
  //     expectTypeOf<Const>().toEqualTypeOf(TestObjectConst.store.books[1])
  //   })
  // }

  {
    const path = 'store.books[1].category'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestObject)
      expect(result).toEqual(TestObject.store.books[1]?.category)

      type Type = TypePathParse<typeof path, TestObjectType>
      expectTypeOf<Type>().toEqualTypeOf(TestObject.store.books[1]?.category)

      type Const = TypePathParse<typeof path, TestObjectConstType>
      expectTypeOf<Const>().toEqualTypeOf(TestObjectConst.store.books[1].category)
    })
  }

  // JOHN
  // {
  //   const path = 'store.books.1.category'
  //   test(path, () => {
  //     const result = TypePaths.getValue(TypePaths.fromString(path), TestObject)
  //     expect(result).toEqual(TestObject.store.books[1]?.category)
  //
  //     type Type = TypePathParse<typeof path, TestObjectType>
  //     expectTypeOf<Type>().toEqualTypeOf(TestObject.store.books[1]?.category)
  //
  //     type Const = TypePathParse<typeof path, TestObjectConstType>
  //     expectTypeOf<Const>().toEqualTypeOf(TestObjectConst.store.books[1].category)
  //   })
  // }

  {
    const path = 'store.books[*].category'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestObject)
      expect(result).toEqual(TestObject.store.books.map((it) => it.category))

      type Type = TypePathParse<typeof path, TestObjectType>
      expectTypeOf<Type>().toEqualTypeOf(TestObject.store.books.map((it) => it.category))

      type Const = TypePathParse<typeof path, TestObjectConstType>
      expectTypeOf<Const>().toEqualTypeOf<[BookCategory.Reference, BookCategory.Fiction, BookCategory.Fiction, BookCategory.Fiction]>()
    })
  }

  {
    const path = 'store.books.*.category'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestObject)
      expect(result).toEqual(TestObject.store.books.map((it) => it.category))

      type Type = TypePathParse<typeof path, TestObjectType>
      expectTypeOf<Type>().toEqualTypeOf(TestObject.store.books.map((it) => it.category))

      type Const = TypePathParse<typeof path, TestObjectConstType>
      expectTypeOf<Const>().toEqualTypeOf<[BookCategory.Reference, BookCategory.Fiction, BookCategory.Fiction, BookCategory.Fiction]>()
    })
  }

  {
    const path = 'store.books.category'
    test(path, () => {
      expect(() => TypePaths.getValue(TypePaths.fromString(path), TestObject)).toThrow()

      // JOHN we shoudn't resolve a type in the unsupported implicit wildcard case, but we do
      // type Type = TypePathParse<typeof path, TestObjectType>
      // expectTypeOf<Type>().toEqualTypeOf(TestObject.store.books.map((it) => it.category))
      //
      // type Const = TypePathParse<typeof path, TestObjectConstType>
      // expectTypeOf<Const>().toEqualTypeOf<[BookCategory.Reference, BookCategory.Fiction, BookCategory.Fiction, BookCategory.Fiction]>()
    })
  }

  {
    const path = 'store.books[*].publisher.name'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestObject)
      expect(result).toEqual(TestObject.store.books.map((it) => it.publisher?.name))

      type Type = TypePathParse<typeof path, TestObjectType>
      expectTypeOf<Type>().toEqualTypeOf(TestObject.store.books.map((it) => it.publisher?.name))

      type Const = TypePathParse<typeof path, TestObjectConstType>
      expectTypeOf<Const>().toEqualTypeOf<[never, 'John Publisher', never, 1234]>()
    })
  }

  {
    const path = 'store.books[1].publisher.name'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestObject)
      expect(result).toEqual(TestObject.store.books[1]?.publisher?.name)

      type Type = TypePathParse<typeof path, TestObjectType>
      expectTypeOf<Type>().toEqualTypeOf(TestObject.store.books[1]?.publisher?.name)

      type Const = TypePathParse<typeof path, TestObjectConstType>
      expectTypeOf<Const>().toEqualTypeOf<'John Publisher'>()
    })
  }

  {
    const path = 'store.advertisement'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestObject)
      expect(result).toEqual(TestObject.store.advertisement)

      type Type = TypePathParse<typeof path, TestObjectType>
      expectTypeOf<Type>().toEqualTypeOf(TestObject.store.advertisement)

      type Const = TypePathParse<typeof path, TestObjectConstType>
      expectTypeOf<Const>().toEqualTypeOf<TestObjectConstType['store']['advertisement']>()
    })
  }

  {
    const path = 'store.advertisement.value'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestObject)
      expect(result).toEqual(TestObject.store.advertisement?.value)

      type Type = TypePathParse<typeof path, TestObjectType>
      expectTypeOf<Type>().toEqualTypeOf(TestObject.store.advertisement?.value)

      // JOHN
      // type Const = TypePathParse<typeof path, TestObjectConstType>
      // expectTypeOf<Const>().toEqualTypeOf<never>()
    })
  }

  {
    const path = 'store.additionalAdvertisement'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestObject)
      expect(result).toEqual(TestObject.store.additionalAdvertisement)

      type Type = TypePathParse<typeof path, TestObjectType>
      expectTypeOf<Type>().toEqualTypeOf(TestObject.store.additionalAdvertisement)

      type Const = TypePathParse<typeof path, TestObjectConstType>
      expectTypeOf<Const>().toEqualTypeOf<never>()
    })
  }

  {
    const path = 'store.additionalAdvertisement.value'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestObject)
      expect(result).toEqual(TestObject.store.additionalAdvertisement?.value)

      type Type = TypePathParse<typeof path, TestObjectType>
      expectTypeOf<Type>().toEqualTypeOf(TestObject.store.additionalAdvertisement?.value)

      type Const = TypePathParse<typeof path, TestObjectConstType>
      expectTypeOf<Const>().toEqualTypeOf<never>()
    })
  }

  {
    const path = ''
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestData)
      expect(result).toEqual(TestData)

      type Type = TypePathParse<typeof path, TestDataType>
      expectTypeOf<Type>().toEqualTypeOf(TestData)

      type Const = TypePathParse<typeof path, TestDataConstType>
      expectTypeOf<Const>().toEqualTypeOf<TestDataConstType>()
    })
  }

  {
    const path = '*'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestData)
      expect(result).toEqual(TestData)

      type Type = TypePathParse<typeof path, TestDataType>
      expectTypeOf<Type>().toEqualTypeOf(TestData)

      type Const = TypePathParse<typeof path, TestDataConstType>
      expectTypeOf<Const>().toEqualTypeOf<TestDataConstType>()
    })
  }

  {
    const path = '[*]'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestData)
      expect(result).toEqual(TestData)

      type Type = TypePathParse<typeof path, TestDataType>
      expectTypeOf<Type>().toEqualTypeOf(TestData)

      type Const = TypePathParse<typeof path, TestDataConstType>
      expectTypeOf<Const>().toEqualTypeOf<TestDataConstType>()
    })
  }

  {
    const path = '[*].name'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestData)
      expect(result).toEqual(TestData.map((it) => it.name))

      type Type = TypePathParse<typeof path, TestDataType>
      expectTypeOf<Type>().toEqualTypeOf(TestData.map((it) => it.name))

      type Const = TypePathParse<typeof path, TestDataConstType>
      expectTypeOf<Const>().toEqualTypeOf<['Books A Million', 'Amazon']>()
    })
  }

  {
    const path = '[1]'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestData)
      expect(result).toEqual(TestData[1])

      type Type = TypePathParse<typeof path, TestDataType>
      expectTypeOf<Type>().toEqualTypeOf(TestData[1])

      type Const = TypePathParse<typeof path, TestDataConstType>
      expectTypeOf<Const>().toEqualTypeOf<TestDataConstType[1]>()
    })
  }

  {
    const path = '[*].store.bicycle'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestData)
      expect(result).toEqual(TestData.map((it) => it.store.bicycle))

      type Type = TypePathParse<typeof path, TestDataType>
      expectTypeOf<Type>().toEqualTypeOf(TestData.map((it) => it.store.bicycle))

      type Const = TypePathParse<typeof path, TestDataConstType>
      expectTypeOf<Const>().toEqualTypeOf<[TestDataConstType[0]['store']['bicycle'], TestDataConstType[1]['store']['bicycle']]>()
    })
  }

  {
    const path = '[1].store.bicycle'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestData)
      expect(result).toEqual(TestData[1]?.store.bicycle)

      type Type = TypePathParse<typeof path, TestDataType>
      expectTypeOf<Type>().toEqualTypeOf(TestData[1]?.store.bicycle)

      type Const = TypePathParse<typeof path, TestDataConstType>
      expectTypeOf<Const>().toEqualTypeOf<TestDataConstType[1]['store']['bicycle']>()
    })
  }

  {
    const path = '[*].store.additionalAdvertisement'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestData)
      expect(result).toEqual(TestData.map((it) => it.store.additionalAdvertisement))

      type Type = TypePathParse<typeof path, TestDataType>
      expectTypeOf<Type>().toEqualTypeOf(TestData.map((it) => it.store.additionalAdvertisement))

      type Const = TypePathParse<typeof path, TestDataConstType>
      expectTypeOf<Const>().toEqualTypeOf<[never, never]>()
    })
  }

  {
    const path = '[*].store.additionalAdvertisement.value'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestData)
      expect(result).toEqual(TestData.map((it) => it.store.additionalAdvertisement?.value))

      type Type = TypePathParse<typeof path, TestDataType>
      expectTypeOf<Type>().toEqualTypeOf(TestData.map((it) => it.store.additionalAdvertisement?.value))

      type Const = TypePathParse<typeof path, TestDataConstType>
      expectTypeOf<Const>().toEqualTypeOf<[never, never]>()
    })
  }

  {
    const path = '[0].store.additionalAdvertisement'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestData)
      expect(result).toEqual(TestData[0]?.store.additionalAdvertisement)

      type Type = TypePathParse<typeof path, TestDataType>
      expectTypeOf<Type>().toEqualTypeOf(TestData[0]?.store.additionalAdvertisement)

      type Const = TypePathParse<typeof path, TestDataConstType>
      expectTypeOf<Const>().toEqualTypeOf<never>()
    })
  }

  {
    const path = '[0].store.additionalAdvertisement.value'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestData)
      expect(result).toEqual(TestData[0]?.store.additionalAdvertisement?.value)

      type Type = TypePathParse<typeof path, TestDataType>
      expectTypeOf<Type>().toEqualTypeOf(TestData[0]?.store.additionalAdvertisement?.value)

      type Const = TypePathParse<typeof path, TestDataConstType>
      expectTypeOf<Const>().toEqualTypeOf<never>()
    })
  }

  {
    const path = '[*].store.books'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestData)
      expect(result).toEqual(TestData.map((it) => it.store.books))

      type Type = TypePathParse<typeof path, TestDataType>
      expectTypeOf<Type>().toEqualTypeOf(TestData.map((it) => it.store.books))

      type Const = TypePathParse<typeof path, TestDataConstType>
      expectTypeOf<Const>().toEqualTypeOf<[TestDataConstType[0]['store']['books'], TestDataConstType[1]['store']['books']]>()
    })
  }

  {
    const path = '[*].store.books[*]'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestData)
      expect(result).toEqual(TestData.flatMap((it) => it.store.books))

      // JOHN
      // type Type = TypePathParse<typeof path, TestDataType>
      // expectTypeOf<Type>().toEqualTypeOf(TestData.flatMap((it) => it.store.books))
      //
      // type Const = TypePathParse<typeof path, TestDataConstType>
      // expectTypeOf<Const>().toEqualTypeOf<[TestDataConstType[0]['store']['books'], TestDataConstType[1]['store']['books']]>()
    })
  }

  {
    const path = '[*].store.books[*].author'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestData)
      expect(result).toEqual(TestData.flatMap((it) => it.store.books.map((it) => it.author)))

      // JOHN
      // type Type = TypePathParse<typeof path, TestDataType>
      // expectTypeOf<Type>().toEqualTypeOf(TestData.map((it) => it.store.books.map((it) => it.author)))
      //
      // type Const = TypePathParse<typeof path, TestDataConstType>
      // expectTypeOf<Const>().toEqualTypeOf<[TestDataConstType[0]['store']['books'], TestDataConstType[1]['store']['books']]>()
    })
  }

  {
    const path = '[0].store.books[0].author'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestData)
      expect(result).toEqual(TestData[0]?.store.books[0]?.author)

      type Type = TypePathParse<typeof path, TestDataType>
      expectTypeOf<Type>().toEqualTypeOf(TestData[0]?.store.books[0]?.author)

      type Const = TypePathParse<typeof path, TestDataConstType>
      expectTypeOf<Const>().toEqualTypeOf<'Nigel Rees'>()
    })
  }

  {
    const path = '0.store.books.0.author'
    test(path, () => {
      const result = TypePaths.getValue(TypePaths.fromString(path), TestData)
      expect(result).toEqual(TestData[0]?.store.books[0]?.author)

      // JOHN
      // type Type = TypePathParse<typeof path, TestDataType>
      // expectTypeOf<Type>().toEqualTypeOf(TestData[0]?.store.books[0]?.author)
      //
      // type Const = TypePathParse<typeof path, TestDataConstType>
      // expectTypeOf<Const>().toEqualTypeOf<'Nigel Rees'>()
    })
  }

  // JOHN need to do some double array tests on store => books

  // JOHN
  // type MatrixType = Array<
  //   Array<{
  //     category: string
  //     author: string
  //     title: string
  //     price: number
  //     isbn?: {
  //       name: string
  //       number: string
  //     }
  //   }>
  // >

  // {
  //   const path = '[*][*].title'
  //   test(path, () => {
  //     type Expected = Array<Array<string | undefined>>
  //     type Test = TypePathParse<typeof path, MatrixType>
  //
  //     expectTypeOf<Expected>().toEqualTypeOf<Test>()
  //   })
  // }

  // {
  //   const path = '[*][*].title'
  //   test(path, () => {
  //     type Expected = Array<Array<string | undefined>>
  //     type Test = TypePathParse<typeof path, MatrixType>
  //
  //     expectTypeOf<Expected>().toEqualTypeOf<Test>()
  //   })
  // }
})

describe('TypePaths.intersect', () => {
  test('should intersect matching simple property path', () => {
    const objectPath = TypePaths.fromString('store.books')
    const typePath = TypePaths.fromString('store.books')
    const result = TypePaths.intersect(objectPath, typePath)
    expect(result).toEqual(['store', 'books'])
  })

  test('should intersect when ObjectPath is longer than TypePath', () => {
    const objectPath = TypePaths.fromString('store.books.category')
    const typePath = TypePaths.fromString('store.books')
    const result = TypePaths.intersect(objectPath, typePath)
    expect(result).toEqual(['store', 'books'])
  })

  test('should throw when TypePath is longer than ObjectPath', () => {
    const objectPath = TypePaths.fromString('store.books')
    const typePath = TypePaths.fromString('store.books.category')
    expect(() => TypePaths.intersect(objectPath, typePath)).toThrow()
  })

  test('should handle empty paths', () => {
    const objectPath = TypePaths.fromString('')
    const typePath = TypePaths.fromString('')
    const result = TypePaths.intersect(objectPath, typePath)
    expect(result).toEqual([])
  })

  test('should handle wildcard selector in TypePath', () => {
    const objectPath = TypePaths.fromString('store.books')
    const typePath = TypePaths.fromString('store.*')
    const result = TypePaths.intersect(objectPath, typePath)
    expect(result).toEqual(['store', 'books'])
  })

  test('should handle array index matching TypePath array selector', () => {
    const objectPath = TypePaths.fromString('store.books[1]')
    const typePath = TypePaths.fromString('store.books[0,1,2]')
    const result = TypePaths.intersect(objectPath, typePath)
    expect(result).toEqual(['store', 'books', [1]])
  })

  test('should throw when array index does not match TypePath array selector', () => {
    const objectPath = TypePaths.fromString('store.books[5]')
    const typePath = TypePaths.fromString('store.books[0,1,2]')
    expect(() => TypePaths.intersect(objectPath, typePath)).toThrow()
  })

  test('should handle name-style index matching TypePath array selector', () => {
    const objectPath = TypePaths.fromString('store.books.1')
    const typePath = TypePaths.fromString('store.books[0,1,2]')
    const result = TypePaths.intersect(objectPath, typePath)
    expect(result).toEqual(['store', 'books', '1'])
  })

  test('should throw when name-style index does not match TypePath array selector', () => {
    const objectPath = TypePaths.fromString('store.books.5')
    const typePath = TypePaths.fromString('store.books[0,1,2]')
    expect(() => TypePaths.intersect(objectPath, typePath)).toThrow()
  })

  test('should handle array selector in ObjectPath matching string selector in TypePath', () => {
    const objectPath = TypePaths.fromString('store[1]')
    const typePath = TypePaths.fromString('store.1')
    const result = TypePaths.intersect(objectPath, typePath)
    expect(result).toEqual(['store', [1]])
  })

  test('should throw when array selector in ObjectPath does not match string selector in TypePath', () => {
    const objectPath = TypePaths.fromString('store[2]')
    const typePath = TypePaths.fromString('store.1')
    expect(() => TypePaths.intersect(objectPath, typePath)).toThrow()
  })

  test('should handle string selector matching in both paths', () => {
    const objectPath = TypePaths.fromString('store.books.category')
    const typePath = TypePaths.fromString('store.books.category')
    const result = TypePaths.intersect(objectPath, typePath)
    expect(result).toEqual(['store', 'books', 'category'])
  })

  test('should throw when string selectors do not match', () => {
    const objectPath = TypePaths.fromString('store.books.title')
    const typePath = TypePaths.fromString('store.books.category')
    expect(() => TypePaths.intersect(objectPath, typePath)).toThrow()
  })

  test('should handle complex path with mixed selectors and wildcards', () => {
    const objectPath = TypePaths.fromString('store.books[2].title')
    const typePath = TypePaths.fromString('store.books.*')
    const result = TypePaths.intersect(objectPath, typePath)
    expect(result).toEqual(['store', 'books', [2]])
  })

  test('should handle wildcard array selector in TypePath', () => {
    const objectPath = TypePaths.fromString('store.books[2]')
    const typePath = TypePaths.fromString('store.books[*]')
    const result = TypePaths.intersect(objectPath, typePath)
    expect(result).toEqual(['store', 'books', [2]])
  })

  test('should return early when TypePath is shorter than ObjectPath', () => {
    const objectPath = TypePaths.fromString('a.b.c.d.e')
    const typePath = TypePaths.fromString('a.b')
    const result = TypePaths.intersect(objectPath, typePath)
    expect(result).toEqual(['a', 'b'])
  })

  test('should handle root array access', () => {
    const objectPath = TypePaths.fromString('[0]')
    const typePath = TypePaths.fromString('[*]')
    const result = TypePaths.intersect(objectPath, typePath)
    expect(result).toEqual([[0]])
  })

  test('should handle root array access with specific index', () => {
    const objectPath = TypePaths.fromString('[1]')
    const typePath = TypePaths.fromString('[0,1,2]')
    const result = TypePaths.intersect(objectPath, typePath)
    expect(result).toEqual([[1]])
  })

  test('should throw when root array access does not match', () => {
    const objectPath = TypePaths.fromString('[5]')
    const typePath = TypePaths.fromString('[0,1,2]')
    expect(() => TypePaths.intersect(objectPath, typePath)).toThrow()
  })
})

describe('TypePaths.matches', () => {
  test('should match identical paths', () => {
    const targetPath = TypePaths.fromString('store.books')
    const matchingPath = TypePaths.fromString('store.books')

    expect(TypePaths.matches(targetPath, matchingPath)).toBe(true)
  })

  test('should match with wildcard selector', () => {
    const targetPath = TypePaths.fromString('store.books')
    const matchingPath = TypePaths.fromString('store.*')

    expect(TypePaths.matches(targetPath, matchingPath)).toBe(true)
  })

  test('should match array index with wildcard', () => {
    const targetPath = TypePaths.fromString('store.books[1]')
    const matchingPath = TypePaths.fromString('store.books[*]')

    expect(TypePaths.matches(targetPath, matchingPath)).toBe(true)
  })

  test('should match multiple array indices with wildcard', () => {
    const targetPath = TypePaths.fromString('store.books[1,2,3]')
    const matchingPath = TypePaths.fromString('store.books[*]')

    expect(TypePaths.matches(targetPath, matchingPath)).toBe(true)
  })

  test('should match when target has single index and matching has multiple indices containing that index', () => {
    const targetPath = TypePaths.fromString('store.books[1]')
    const matchingPath = TypePaths.fromString('store.books[0,1,2]')

    expect(TypePaths.matches(targetPath, matchingPath)).toBe(true)
  })

  test('should match when both have multiple indices and target is subset of matching', () => {
    const targetPath = TypePaths.fromString('store.books[1,2]')
    const matchingPath = TypePaths.fromString('store.books[0,1,2,3]')

    expect(TypePaths.matches(targetPath, matchingPath)).toBe(true)
  })

  test('should match name selector with array index when they represent same value', () => {
    const targetPath = TypePaths.fromString('store.books.1')
    const matchingPath = TypePaths.fromString('store.books[1]')

    expect(TypePaths.matches(targetPath, matchingPath)).toBe(true)
  })

  test('should match array index with name selector when they represent same value', () => {
    const targetPath = TypePaths.fromString('store.books[1]')
    const matchingPath = TypePaths.fromString('store.books.1')

    expect(TypePaths.matches(targetPath, matchingPath)).toBe(true)
  })

  test('should match shorter matching path (prefix match)', () => {
    const targetPath = TypePaths.fromString('store.books.category')
    const matchingPath = TypePaths.fromString('store.books')

    expect(TypePaths.matches(targetPath, matchingPath)).toBe(true)
  })

  test('should match complex nested path with wildcards', () => {
    const targetPath = TypePaths.fromString('store.books[1].isbn.number')
    const matchingPath = TypePaths.fromString('store.books[*].isbn.*')

    expect(TypePaths.matches(targetPath, matchingPath)).toBe(true)
  })

  test('should NOT match when target has wildcard but matching has specific selector', () => {
    const targetPath = TypePaths.fromString('store.*')
    const matchingPath = TypePaths.fromString('store.books')

    expect(TypePaths.matches(targetPath, matchingPath)).toBe(false)
  })

  test('should NOT match when target single index not in matching multiple indices', () => {
    const targetPath = TypePaths.fromString('store.books[5]')
    const matchingPath = TypePaths.fromString('store.books[0,1,2]')

    expect(TypePaths.matches(targetPath, matchingPath)).toBe(false)
  })

  test('should NOT match when target multiple indices not subset of matching', () => {
    const targetPath = TypePaths.fromString('store.books[1,2,5]')
    const matchingPath = TypePaths.fromString('store.books[0,1,2,3]')

    expect(TypePaths.matches(targetPath, matchingPath)).toBe(false)
  })

  test('should NOT match when name selector and array index represent different values', () => {
    const targetPath = TypePaths.fromString('store.books.2')
    const matchingPath = TypePaths.fromString('store.books[1]')

    expect(TypePaths.matches(targetPath, matchingPath)).toBe(false)
  })

  test('should NOT match when target array has multiple indices but matching expects single', () => {
    const targetPath = TypePaths.fromString('store.books[1,2]')
    const matchingPath = TypePaths.fromString('store.books.1')

    expect(TypePaths.matches(targetPath, matchingPath)).toBe(false)
  })

  test('should NOT match when matching path is longer than target', () => {
    const targetPath = TypePaths.fromString('store.books')
    const matchingPath = TypePaths.fromString('store.books.category')
    expect(TypePaths.matches(targetPath, matchingPath)).toBe(false)
  })

  test('should NOT match different property names', () => {
    const targetPath = TypePaths.fromString('store.books')
    const matchingPath = TypePaths.fromString('store.magazines')

    expect(TypePaths.matches(targetPath, matchingPath)).toBe(false)
  })

  test('should match empty paths', () => {
    const targetPath = TypePaths.fromString('')
    const matchingPath = TypePaths.fromString('')

    expect(TypePaths.matches(targetPath, matchingPath)).toBe(true)
  })

  test('should match target with empty matching path', () => {
    const targetPath = TypePaths.fromString('store.books')
    const matchingPath = TypePaths.fromString('')

    expect(TypePaths.matches(targetPath, matchingPath)).toBe(true)
  })

  test('should match root wildcard with any single selector', () => {
    const targetPath = TypePaths.fromString('store')
    const matchingPath = TypePaths.fromString('*')

    expect(TypePaths.matches(targetPath, matchingPath)).toBe(true)
  })

  test('should match root array access with wildcard', () => {
    const targetPath = TypePaths.fromString('[1]')
    const matchingPath = TypePaths.fromString('[*]')

    expect(TypePaths.matches(targetPath, matchingPath)).toBe(true)
  })

  test('should match complex matrix access', () => {
    const targetPath = TypePaths.fromString('matrix[0][1].category')
    const matchingPath = TypePaths.fromString('matrix[*][*].category')

    expect(TypePaths.matches(targetPath, matchingPath)).toBe(true)
  })

  test('should handle mixed array and property access', () => {
    const targetPath = TypePaths.fromString('store.books[1].publisher.credits[0].name')
    const matchingPath = TypePaths.fromString('store.books[*].publisher.*')

    expect(TypePaths.matches(targetPath, matchingPath)).toBe(true)
  })

  test('should type narrow correctly on successful match', () => {
    const targetPath = TypePaths.fromString('store.books[1].category')
    const matchingPath = TypePaths.fromString('store.books[*].category')
    expect(TypePaths.matches(targetPath, matchingPath)).toBe(true)
  })
})
