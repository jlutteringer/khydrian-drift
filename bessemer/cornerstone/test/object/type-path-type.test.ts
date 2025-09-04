import { ParseTypePath, TypePathParse } from '@bessemer/cornerstone/object/type-path-type'

describe('TypePaths Type Resolution', () => {
  type TestType = {
    store: {
      books: Array<{
        category: string
        author: string
        title: string
        price: number
        isbn?: {
          name: string
          number: string
        }
        publisher: {
          name: string
          credits: Array<string>
        } | null
      }>
      bicycle: {
        color: string
        price: number
      }
    }
    employees: Array<string>
  }

  type ConstTestType = {
    store: {
      books: [
        {
          category: 'reference'
          author: 'Nigel Rees'
          title: 'Sayings of the Century'
          price: 8.95
          publisher: null
        },
        {
          category: 'fiction'
          author: 'Evelyn Waugh'
          title: 'Sword of Honour'
          price: 12.99
          publisher: {
            name: 'John Publisher'
            credits: ['First Credit', 'Second Credit']
          }
        },
        {
          category: 'fiction'
          author: 'Herman Melville'
          title: 'Moby Dick'
          isbn: {
            name: 'John Library'
            number: '0-553-21311-3'
          }
          price: 8.99
          publisher: null
        },
        {
          category: 'fiction'
          author: 'J. R. R. Tolkien'
          title: 'The Lord of the Rings'
          isbn: {
            name: 'The Other Library'
            number: '0-395-19395-8'
          }
          price: 22.99
          publisher: null
        }
      ]
      bicycle: {
        color: 'red'
        price: 399
      }
    }
    employees: ['John', 'Joanne']
  }

  type ArrayType = Array<{
    category: string
    author: string
    title: string
    price: number
    isbn?: {
      name: string
      number: string
    }
  }>

  type ConstArrayType = [
    {
      category: 'reference'
      author: 'Nigel Rees'
      title: 'Sayings of the Century'
      price: 8.95
    },
    {
      category: 'fiction'
      author: 'Evelyn Waugh'
      title: 'Sword of Honour'
      price: 12.99
    },
    {
      category: 'fiction'
      author: 'Herman Melville'
      title: 'Moby Dick'
      isbn: {
        name: 'John Library'
        number: '0-553-21311-3'
      }
      price: 8.99
    },
    {
      category: 'fiction'
      author: 'J. R. R. Tolkien'
      title: 'The Lord of the Rings'
      isbn: {
        name: 'The Other Library'
        number: '0-395-19395-8'
      }
      price: 22.99
    }
  ]

  {
    const path = ''
    test(path, () => {
      type Expected = TestType
      type Test = TypePathParse<typeof path, TestType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })

    test(path, () => {
      type Expected = ConstTestType
      type Test = TypePathParse<typeof path, ConstTestType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })
  }

  {
    const path = '*'
    test(path, () => {
      type Expected = Array<TestType['store'] | TestType['employees']>
      type Test = TypePathParse<typeof path, TestType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })

    test(path, () => {
      type Expected = Array<ConstTestType['store'] | ConstTestType['employees']>
      type Test = TypePathParse<typeof path, ConstTestType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })
  }

  {
    const path = 'store.*'
    test(path, () => {
      type Expected = Array<TestType['store']['books'] | TestType['store']['bicycle']>
      type Test = TypePathParse<typeof path, TestType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })

    test(path, () => {
      type Expected = Array<ConstTestType['store']['books'] | ConstTestType['store']['bicycle']>
      type Test = TypePathParse<typeof path, ConstTestType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })
  }

  {
    const path = 'store'
    test(path, () => {
      type Expected = TestType['store']
      type Test = TypePathParse<typeof path, TestType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })

    test(path, () => {
      type Expected = ConstTestType['store']
      type Test = TypePathParse<typeof path, ConstTestType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })
  }

  {
    const path = 'store.books'
    test(path, () => {
      type Expected = TestType['store']['books']
      type Test = TypePathParse<typeof path, TestType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })

    test(path, () => {
      type Expected = ConstTestType['store']['books']
      type Test = TypePathParse<typeof path, ConstTestType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })
  }

  {
    const path = 'store.books[*]'
    test(path, () => {
      type Expected = TestType['store']['books']
      type Test = TypePathParse<typeof path, TestType>
      type Parse = ParseTypePath<typeof path>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })

    test(path, () => {
      type Expected = ConstTestType['store']['books']
      type Test = TypePathParse<typeof path, ConstTestType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })
  }

  {
    const path = 'store.books.*'
    test(path, () => {
      type Expected = TestType['store']['books']
      type Test = TypePathParse<typeof path, TestType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })

    test(path, () => {
      type Expected = ConstTestType['store']['books']
      type Test = TypePathParse<typeof path, ConstTestType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })
  }

  {
    const path = 'employees[*]'
    test(path, () => {
      type Expected = TestType['employees']
      type Test = TypePathParse<typeof path, TestType>
      type Parse = ParseTypePath<typeof path>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })

    test(path, () => {
      type Expected = ConstTestType['employees']
      type Test = TypePathParse<typeof path, ConstTestType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })
  }

  {
    const path = 'employees[1]'
    test(path, () => {
      type Expected = string | undefined
      type Test = TypePathParse<typeof path, TestType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })

    test(path, () => {
      type Expected = ConstTestType['employees'][1]
      type Test = TypePathParse<typeof path, ConstTestType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })
  }

  {
    const path = 'store.books[1]'
    test(path, () => {
      type Expected = TestType['store']['books'][number] | undefined
      type Test = TypePathParse<typeof path, TestType>
      type Parse = ParseTypePath<typeof path>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })

    test(path, () => {
      type Expected = ConstTestType['store']['books'][1]
      type Test = TypePathParse<typeof path, ConstTestType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })
  }

  {
    const path = 'store.books[1].category'
    test(path, () => {
      type Expected = string | undefined
      type Test = TypePathParse<typeof path, TestType>
      type Parse = ParseTypePath<typeof path>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })

    test(path, () => {
      type Expected = 'fiction'
      type Test = TypePathParse<typeof path, ConstTestType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })
  }

  {
    const path = 'store.books[*].category'
    test(path, () => {
      type Expected = Array<string>
      type Test = TypePathParse<typeof path, TestType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })

    test(path, () => {
      type Expected = ['reference', 'fiction', 'fiction', 'fiction']
      type Test = TypePathParse<typeof path, ConstTestType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })
  }

  {
    const path = 'store.books.*.category'
    test(path, () => {
      type Expected = Array<string>
      type Test = TypePathParse<typeof path, TestType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })

    test(path, () => {
      type Expected = ['reference', 'fiction', 'fiction', 'fiction']
      type Test = TypePathParse<typeof path, ConstTestType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })
  }

  {
    const path = 'store.books[*].publisher.name'
    test(path, () => {
      type Expected = Array<string | undefined>
      type Test = TypePathParse<typeof path, TestType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })

    test(path, () => {
      type Expected = ['reference', 'fiction', 'fiction', 'fiction']
      type Test = TypePathParse<typeof path, ConstTestType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })
  }

  {
    const path = 'store.books[1].publisher.name'
    test(path, () => {
      type Expected = Array<string>
      type Test = TypePathParse<typeof path, TestType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })

    test(path, () => {
      type Expected = ['reference', 'fiction', 'fiction', 'fiction']
      type Test = TypePathParse<typeof path, ConstTestType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })
  }

  {
    const path = ''
    test(path, () => {
      type Expected = ArrayType
      type Test = TypePathParse<typeof path, ArrayType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })

    test(path, () => {
      type Expected = ConstArrayType
      type Test = TypePathParse<typeof path, ConstArrayType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })
  }

  {
    const path = '*'
    test(path, () => {
      type Expected = ArrayType
      type Test = TypePathParse<typeof path, ArrayType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })

    test(path, () => {
      type Expected = ConstArrayType
      type Test = TypePathParse<typeof path, ConstArrayType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })
  }

  {
    const path = '[*]'
    test(path, () => {
      type Expected = ArrayType
      type Test = TypePathParse<typeof path, ArrayType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })

    test(path, () => {
      type Expected = ConstArrayType
      type Test = TypePathParse<typeof path, ConstArrayType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })
  }

  {
    const path = '[*].title'
    test(path, () => {
      type Expected = Array<string>
      type Test = TypePathParse<typeof path, ArrayType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })

    test(path, () => {
      type Expected = ['Sayings of the Century', 'Sword of Honour', 'Moby Dick', 'The Lord of the Rings']
      type Test = TypePathParse<typeof path, ConstArrayType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })
  }

  {
    const path = '[1]'
    test(path, () => {
      type Expected = ArrayType[1] | undefined
      type Test = TypePathParse<typeof path, ArrayType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })

    test(path, () => {
      type Expected = ConstArrayType[1]
      type Test = TypePathParse<typeof path, ConstArrayType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })
  }

  {
    const path = '[1].author'
    test(path, () => {
      type Expected = string | undefined
      type Test = TypePathParse<typeof path, ArrayType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })

    test(path, () => {
      type Expected = ConstArrayType[1]['author']
      type Test = TypePathParse<typeof path, ConstArrayType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })
  }

  {
    const path = '[3].isbn.number'
    test(path, () => {
      type Expected = string | undefined
      type Test = TypePathParse<typeof path, ArrayType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })

    test(path, () => {
      type Expected = ConstArrayType[3]['isbn']['number']
      type Test = TypePathParse<typeof path, ConstArrayType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })
  }

  {
    const path = '[*].isbn'
    test(path, () => {
      type Expected = Array<{ name: string; number: string } | undefined>
      type Test = TypePathParse<typeof path, ArrayType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })

    test(path, () => {
      type Expected = [
        never,
        never,
        {
          name: 'John Library'
          number: '0-553-21311-3'
        },
        {
          name: 'The Other Library'
          number: '0-395-19395-8'
        }
      ]
      type Test = TypePathParse<typeof path, ConstArrayType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })
  }

  {
    const path = '[*].isbn.number'
    test(path, () => {
      type Expected = Array<string | undefined>
      type Test = TypePathParse<typeof path, ArrayType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })

    test(path, () => {
      type Expected = [never, never, '0-553-21311-3', '0-395-19395-8']
      type Test = TypePathParse<typeof path, ConstArrayType>

      const _typeTest: Test = {} as Expected
      const _reverseTest: Expected = {} as Test
    })
  }
})
