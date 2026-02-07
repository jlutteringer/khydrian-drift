import { Eithers } from '@bessemer/cornerstone'
import { Either } from '@bessemer/cornerstone/either'

describe('Eithers.left', () => {
  test('should create a left value', () => {
    const result = Eithers.left(5)
    expect(result).toBe(5)
    expect(Eithers.isLeft(result)).toBe(true)
  })

  test('should handle string values', () => {
    const result = Eithers.left('error')
    expect(result).toBe('error')
    expect(Eithers.isLeft(result)).toBe(true)
  })

  test('should handle object values', () => {
    const error = { code: 404, message: 'Not found' }
    const result = Eithers.left(error)
    expect(result).toBe(error)
    expect(Eithers.isLeft(result)).toBe(true)
  })

  test('should handle null values', () => {
    const result = Eithers.left(null)
    expect(result).toBeNull()
    expect(Eithers.isLeft(result)).toBe(true)
  })
})

describe('Eithers.right', () => {
  test('should create a right value', () => {
    const result = Eithers.right(5)
    expect(Eithers.isRight(result)).toBe(true)
    expect(result.value).toBe(5)
  })

  test('should handle string values', () => {
    const result = Eithers.right('success')
    expect(Eithers.isRight(result)).toBe(true)
    expect(result.value).toBe('success')
  })

  test('should handle object values', () => {
    const data = { id: 1, name: 'John' }
    const result = Eithers.right(data)
    expect(Eithers.isRight(result)).toBe(true)
    expect(result.value).toBe(data)
  })

  test('should handle null values', () => {
    const result = Eithers.right(null)
    expect(Eithers.isRight(result)).toBe(true)
    expect(result.value).toBeNull()
  })
})

describe('Eithers.isLeft', () => {
  test('should return true for left values', () => {
    expect(Eithers.isLeft(Eithers.left(5))).toBe(true)
    expect(Eithers.isLeft(Eithers.left('error'))).toBe(true)
    expect(Eithers.isLeft(Eithers.left(null))).toBe(true)
  })

  test('should return false for right values', () => {
    expect(Eithers.isLeft(Eithers.right(5))).toBe(false)
    expect(Eithers.isLeft(Eithers.right('success'))).toBe(false)
    expect(Eithers.isLeft(Eithers.right(null))).toBe(false)
  })
})

describe('Eithers.isRight', () => {
  test('should return true for right values', () => {
    expect(Eithers.isRight(Eithers.right(5))).toBe(true)
    expect(Eithers.isRight(Eithers.right('success'))).toBe(true)
    expect(Eithers.isRight(Eithers.right(null))).toBe(true)
  })

  test('should return false for left values', () => {
    expect(Eithers.isRight(Eithers.left(5))).toBe(false)
    expect(Eithers.isRight(Eithers.left('error'))).toBe(false)
    expect(Eithers.isRight(Eithers.left(null))).toBe(false)
  })

  test('should return false for plain objects', () => {
    expect(Eithers.isRight({ value: 5 })).toBe(false)
    expect(Eithers.isRight({})).toBe(false)
  })

  test('should return false for primitive values', () => {
    expect(Eithers.isRight(5)).toBe(false)
    expect(Eithers.isRight('string')).toBe(false)
    expect(Eithers.isRight(true)).toBe(false)
  })
})

describe('Eithers.assertLeft', () => {
  test('should not throw for left values', () => {
    const leftValue = Eithers.left(5)
    expect(() => Eithers.assertLeft(leftValue)).not.toThrow()
  })

  test('should throw for right values', () => {
    const rightValue = Eithers.right(5)
    expect(() => Eithers.assertLeft(rightValue)).toThrow()
  })
})

describe('Eithers.assertRight', () => {
  test('should not throw for right values', () => {
    const rightValue = Eithers.right(5)
    expect(() => Eithers.assertRight(rightValue)).not.toThrow()
  })

  test('should throw for left values', () => {
    const leftValue = Eithers.left(5)
    expect(() => Eithers.assertRight(leftValue)).toThrow()
  })
})

describe('Eithers.map', () => {
  test('should map left values', () => {
    const result = Eithers.map(Eithers.left(5), (x) => x * 2)
    Eithers.assertLeft(result)
    expect(result).toBe(10)
  })

  test('should not map right values', () => {
    const result = Eithers.map(Eithers.right(5) as Either<number, number>, (x) => x * 2)
    Eithers.assertRight(result)
    expect(result.value).toBe(5)
  })

  test('should handle string transformations', () => {
    const result = Eithers.map(Eithers.left('hello'), (x) => x.toUpperCase())
    Eithers.assertLeft(result)
    expect(result).toBe('HELLO')
  })

  test('should handle async mappers', async () => {
    const result = await Eithers.map(Eithers.left(5), async (x) => x * 2)
    Eithers.assertLeft(result)
    expect(result).toBe(10)
  })

  test('should not map right values with async mappers', async () => {
    const result = await Eithers.map(Eithers.right(5) as Either<number, number>, async (x) => x * 2)
    Eithers.assertRight(result)
    expect(result.value).toBe(5)
  })
})

describe('Eithers.flatMap', () => {
  test('should flatMap left values to left', () => {
    const result = Eithers.flatMap(Eithers.left(5), (x) => Eithers.left(x * 2))
    Eithers.assertLeft(result)
    expect(result).toBe(10)
  })

  test('should flatMap left values to right', () => {
    const result = Eithers.flatMap(Eithers.left(5), (x) => Eithers.right(x * 2))
    Eithers.assertRight(result)
    expect(result.value).toBe(10)
  })

  test('should not flatMap right values', () => {
    const result = Eithers.flatMap(Eithers.right('error'), (x) => Eithers.left(x + '!'))
    Eithers.assertRight(result)
    expect(result.value).toBe('error')
  })

  test('should handle async mappers', async () => {
    const result = await Eithers.flatMap(Eithers.left(5), async (x) => Eithers.left(x * 2))
    Eithers.assertLeft(result)
    expect(result).toBe(10)
  })

  test('should not flatMap right values with async mappers', async () => {
    const result = await Eithers.flatMap(Eithers.right('error'), async (x) => Eithers.left(x + '!'))
    Eithers.assertRight(result)
    expect(result.value).toBe('error')
  })
})

describe('Eithers.mapRight', () => {
  test('should map right values', () => {
    const result = Eithers.mapRight(Eithers.right(5), (x) => x * 2)
    Eithers.assertRight(result)
    expect(result.value).toBe(10)
  })

  test('should not map left values', () => {
    const result = Eithers.mapRight(Eithers.left(5) as Either<number, number>, (x) => x * 2)
    Eithers.assertLeft(result)
    expect(result).toBe(5)
  })

  test('should handle string transformations', () => {
    const result = Eithers.mapRight(Eithers.right('hello'), (x) => x.toUpperCase())
    Eithers.assertRight(result)
    expect(result.value).toBe('HELLO')
  })

  test('should handle async mappers', async () => {
    const result = await Eithers.mapRight(Eithers.right(5), async (x) => x * 2)
    Eithers.assertRight(result)
    expect(result.value).toBe(10)
  })

  test('should not map left values with async mappers', async () => {
    const result = await Eithers.mapRight(Eithers.left(5) as Either<number, number>, async (x) => x * 2)
    Eithers.assertLeft(result)
    expect(result).toBe(5)
  })
})

describe('Eithers.flatMapRight', () => {
  test('should flatMap right values to right', () => {
    const result = Eithers.flatMapRight(Eithers.right(5), (x) => Eithers.right(x * 2))
    Eithers.assertRight(result)
    expect(result.value).toBe(10)
  })

  test('should flatMap right values to left', () => {
    const result = Eithers.flatMapRight(Eithers.right(5), (x) => Eithers.left(x * 2))
    Eithers.assertLeft(result)
    expect(result).toBe(10)
  })

  test('should not flatMap left values', () => {
    const result = Eithers.flatMapRight(Eithers.left('error'), (x) => Eithers.right(x + '!'))
    Eithers.assertLeft(result)
    expect(result).toBe('error')
  })

  test('should handle async mappers', async () => {
    const result = await Eithers.flatMapRight(Eithers.right(5), async (x) => Eithers.right(x * 2))
    Eithers.assertRight(result)
    expect(result.value).toBe(10)
  })

  test('should not flatMap left values with async mappers', async () => {
    const result = await Eithers.flatMapRight(Eithers.left('error'), async (x) => Eithers.right(x + '!'))
    Eithers.assertLeft(result)
    expect(result).toBe('error')
  })
})

describe('Eithers.split', () => {
  test('should split array of lefts and rights', () => {
    const array = [Eithers.left(1), Eithers.right('a'), Eithers.left(2), Eithers.right('b')]
    const [lefts, rights] = Eithers.split(array)
    expect(lefts).toEqual([1, 2])
    expect(rights).toEqual(['a', 'b'])
  })

  test('should handle array with only lefts', () => {
    const array = [Eithers.left(1), Eithers.left(2), Eithers.left(3)]
    const [lefts, rights] = Eithers.split(array)
    expect(lefts).toEqual([1, 2, 3])
    expect(rights).toEqual([])
  })

  test('should handle array with only rights', () => {
    const array = [Eithers.right('a'), Eithers.right('b'), Eithers.right('c')]
    const [lefts, rights] = Eithers.split(array)
    expect(lefts).toEqual([])
    expect(rights).toEqual(['a', 'b', 'c'])
  })

  test('should handle empty array', () => {
    const array: Array<Eithers.Either<number, string>> = []
    const [lefts, rights] = Eithers.split(array)
    expect(lefts).toEqual([])
    expect(rights).toEqual([])
  })

  test('should handle arrays with different types', () => {
    const array = [Eithers.left({ error: 'error1' }), Eithers.right({ data: 'data1' }), Eithers.left({ error: 'error2' })]
    const [lefts, rights] = Eithers.split(array)
    expect(lefts).toEqual([{ error: 'error1' }, { error: 'error2' }])
    expect(rights).toEqual([{ data: 'data1' }])
  })
})
