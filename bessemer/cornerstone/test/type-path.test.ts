import { TypePathParse } from '@bessemer/cornerstone/object/type-path-types'

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
          number: number
        }
      }>
      bicycle: {
        color: string
        price: number
      }
    }
  }

  type ConstTestType = {
    store: {
      books: [
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
      bicycle: {
        color: 'red'
        price: 399
      }
    }
  }

  type ArrayType = Array<{
    category: string
    author: string
    title: string
    price: number
    isbn?: {
      name: string
      number: number
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
})
