import * as Results from '@bessemer/cornerstone/result'
import { Failure, Result, Success } from '@bessemer/cornerstone/result'

describe('Results.success', () => {
  test('should create a Success instance', () => {
    const result = Results.success(42)

    expect(result.isSuccess).toBe(true)
    expect(result.value).toBe(42)
    expect(result.isLeft).toBe(false)
    expect(result.isRight).toBe(true)
  })
})

describe('Results.failure', () => {
  test('should create a Failure instance with value', () => {
    const error = new Error('Something went wrong')
    const result = Results.failure(error)

    expect(result.isSuccess).toBe(false)
    expect(result.value).toBe(error)
    expect(result.isLeft).toBe(true)
    expect(result.isRight).toBe(false)
  })

  test('should create a Failure instance without value', () => {
    const result = Results.failure()
    expect(result.isSuccess).toBe(false)
    expect(result.value).toBeUndefined()
  })

  test('should handle string errors', () => {
    const result = Results.failure('Error message')
    expect(result.isSuccess).toBe(false)
    expect(result.value).toBe('Error message')
  })
})

describe('Result.getOrThrow', () => {
  test('should return the value', () => {
    const result = Results.success(42)
    expect(result.getOrThrow()).toBe(42)
  })

  test('should throw the failure value', () => {
    const error = new Error('Test error')
    const result = Results.failure(error)

    expect(() => result.getOrThrow()).toThrow(error)
  })

  test('should throw string failures', () => {
    const result = Results.failure('Error message')

    expect(() => result.getOrThrow()).toThrow('Error message')
  })
})

describe('Result.map', () => {
  test('should transform the success value', () => {
    const result = Results.success(5)
    const mapped = result.map((x) => x * 2)

    expect(mapped.isSuccess).toBe(true)
    expect(mapped.value).toBe(10)
  })

  test('should chain transformations', () => {
    const result = Results.success(5)
      .map((x) => x * 2)
      .map((x) => x.toString())

    expect(result.isSuccess).toBe(true)
    expect(result.value).toBe('10')
  })

  test('should not transform and return same failure', () => {
    const error = new Error('Test error')
    const result = Results.failure(error) as Result<number, Error>
    const mapped = result.map((x) => x * 2)

    expect(mapped.isSuccess).toBe(false)
    expect(mapped.value).toBe(error)
    expect(mapped).toBe(result)
  })
})

describe('Result.mapLeft', () => {
  test('should not transform and return same success', () => {
    const result = Results.success(42) as Result<number, Error>
    const mapped = result.mapLeft((x: any) => x.toString())

    expect(mapped.isSuccess).toBe(true)
    expect(mapped.value).toBe(42)
    expect(mapped).toBe(result)
  })

  test('should transform the failure value', () => {
    const result = Results.failure('error')
    const mapped = result.mapLeft((x) => x.toUpperCase())

    expect(mapped.isSuccess).toBe(false)
    expect(mapped.value).toBe('ERROR')
  })

  test('should chain left transformations', () => {
    const result = Results.failure('error')
      .mapLeft((x) => x.toUpperCase())
      .mapLeft((x) => `[${x}]`)

    expect(result.isSuccess).toBe(false)
    expect(result.value).toBe('[ERROR]')
  })
})

describe('Results.tryValue', () => {
  test('should return success for synchronous values', () => {
    const result = Results.tryValue(() => 42)
    expect(result.isSuccess).toBe(true)
    expect((result as Success<number>).value).toBe(42)
  })

  test('should handle async promises that resolve', async () => {
    const result = await Results.tryValue(async () => 'success')
    expect(result.isSuccess).toBe(true)
    expect(result.getOrThrow()).toBe('success')
  })

  test('should handle async promises that reject', async () => {
    const result = await Results.tryValue(async () => {
      throw new Error('Async error')
    })

    expect(result.isSuccess).toBe(false)
    expect((result as Failure<Error>).value.message).toBe('Async error')
  })

  test('should handle values that return immediately', () => {
    const result = Results.tryValue(() => 'immediate')

    expect(result.isSuccess).toBe(true)
    expect(result.getOrThrow()).toBe('immediate')
  })
})

describe('Results.tryResult', () => {
  test('should catch exceptions when creating results', () => {
    const result = Results.tryResult(() => {
      throw new Error('Result error')
      return Results.success(42)
    })

    expect(result.isSuccess).toBe(false)
    expect((result as Failure<Error>).value.message).toBe('Result error')
  })

  test('should return the result when no exception occurs', () => {
    const result = Results.tryResult(() => Results.success(42))

    expect(result.isSuccess).toBe(true)
    expect((result as Success<number>).value).toBe(42)
  })

  test('should return failure result when no exception occurs', () => {
    const result = Results.tryResult(() => Results.failure('test error'))

    expect(result.isSuccess).toBe(false)
    expect((result as Failure<string>).value).toBe('test error')
  })

  test('should handle async results that resolve', async () => {
    const result = Results.tryResult(async () => Results.success(42))

    expect(result).toBeInstanceOf(Promise)
    const awaited = await result
    expect(awaited.isSuccess).toBe(true)
    expect((awaited as Success<number>).value).toBe(42)
  })

  test('should handle async results that reject', async () => {
    const result = Results.tryResult(async () => {
      throw new Error('Async result error')
      return Results.success(42)
    })

    expect(result).toBeInstanceOf(Promise)
    const awaited = await result
    expect(awaited.isSuccess).toBe(false)
    expect((awaited as Failure<Error>).value.message).toBe('Async result error')
  })
})

describe('Results.gen', () => {
  test('should handle successful generator flow', () => {
    const result = Results.gen(function* () {
      const a = yield* Results.success(5)
      const b = yield* Results.success(a + 10)
      return b * 2
    })

    expect(result.isSuccess).toBe(true)
    expect((result as Success<number>).value).toBe(30)
  })

  test('should short-circuit on first failure', () => {
    const result = Results.gen(function* () {
      const a = yield* Results.success(5)
      const b = yield* Results.failure('error occurred')
      const c = yield* Results.success(10) // This should not execute
      return a + b + c
    })

    expect(result.isSuccess).toBe(false)
    expect((result as Failure<string>).value).toBe('error occurred')
  })

  test('should handle async generators', async () => {
    const result = Results.gen(async function* () {
      const a = yield* Results.success(5)
      const b = yield* Results.success(a + 10)
      return b * 2
    })

    expect(result).toBeInstanceOf(Promise)
    const awaited = await result
    expect(awaited.isSuccess).toBe(true)
    expect((awaited as Success<number>).value).toBe(30)
  })

  test('should handle async generators with failure', async () => {
    const result = Results.gen(async function* () {
      const a = yield* Results.success(5)
      const b = yield* Results.failure('async error')
      return a + b
    })

    expect(result).toBeInstanceOf(Promise)
    const awaited = await result
    expect(awaited.isSuccess).toBe(false)
    expect((awaited as Failure<string>).value).toBe('async error')
  })

  test('should handle empty generator', () => {
    const result = Results.gen(function* () {
      return 42
    })

    expect(result.isSuccess).toBe(true)
    expect((result as Success<number>).value).toBe(42)
  })

  test('should handle generator with only successful yields', () => {
    const result = Results.gen(function* () {
      yield* Results.success('first')
      yield* Results.success('second')
      yield* Results.success('third')
      return 'completed'
    })

    expect(result.isSuccess).toBe(true)
    expect((result as Success<string>).value).toBe('completed')
  })
})
