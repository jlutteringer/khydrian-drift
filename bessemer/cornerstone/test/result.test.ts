import * as Results from '@bessemer/cornerstone/result'
import { Failure, Result } from '@bessemer/cornerstone/result'
import { expectTypeOf } from 'expect-type'
import { Promises } from '@bessemer/cornerstone'

describe('Results.success', () => {
  test('should create a Success instance', () => {
    const result = Results.success(42)

    expect(Results.isSuccess(result)).toBe(true)
    expect(result).toBe(42)
  })
})

describe('Results.failure', () => {
  test('should create a Failure instance with value', () => {
    const error = new Error('Something went wrong')
    const result = Results.failure(error)

    expect(Results.isSuccess(result)).toBe(false)
    expect(result.value).toBe(error)
  })

  test('should create a Failure instance without value', () => {
    const result = Results.failure()
    expect(Results.isSuccess(result)).toBe(false)
    expect(result.value).toBeUndefined()
  })

  test('should handle string errors', () => {
    const result = Results.failure('Error message')
    expect(Results.isSuccess(result)).toBe(false)
    expect(result.value).toBe('Error message')
  })
})

describe('Result.getOrThrow', () => {
  test('should return the value', () => {
    const result = Results.success(42)
    Results.assertSuccess(result)
  })

  test('should throw the failure value', () => {
    const error = new Error('Test error')
    const result = Results.failure(error)
    expect(() => Results.assertSuccess(result)).toThrow(error)
  })

  test('should throw string failures', () => {
    const result = Results.failure('Error message')
    expect(() => Results.assertSuccess(result)).toThrow('Error message')
  })
})

describe('Result.map', () => {
  test('should transform the success value', async () => {
    const result = Results.success(5)
    const mapped = Results.map(result, (x) => x * 2)
    const mappedAsync = Results.map(result, async (x) => x * 2)

    expect(Results.isSuccess(mapped)).toBe(true)
    expect(mapped).toBe(10)
    expect(Promises.isPromise(mappedAsync)).toBe(true)

    const mapped2 = await mappedAsync
    expect(Results.isSuccess(mapped2)).toBe(true)
    expect(mapped2).toBe(10)
  })

  test('should chain transformations', () => {
    const result = Results.map(
      Results.map(Results.success(5), (x) => x * 2),
      (x) => x.toString()
    )

    expect(Results.isSuccess(result)).toBe(true)
    expect(result).toBe('10')
  })

  test('should not transform and return same failure', () => {
    const error = new Error('Test error')
    const result = Results.failure(error) as Result<number, Error>
    const mapped = Results.map(result, (x) => x * 2)

    expect(Results.isSuccess(mapped)).toBe(false)
    Results.assertFailure(mapped)
    expect(mapped.value).toBe(error)
    expect(mapped).toBe(result)
  })

  test('should work with no return', () => {
    const result = Results.map(Results.success(5) as Result<number>, (_) => {})
    expectTypeOf(result).toEqualTypeOf<Result<void>>()
  })
})

describe('Result.mapLeft', () => {
  test('should not transform and return same success', () => {
    const result = Results.success(42) as Result<number, Error>
    const mapped = Results.mapFailure(result, (x) => x.toString())
    Results.assertSuccess(mapped)
    expect(mapped).toBe(42)
  })

  test('should transform the failure value', () => {
    const result = Results.failure('error')
    const mapped = Results.mapFailure(result, (x) => x.toUpperCase())
    Results.assertFailure(mapped)
    expect(mapped.value).toBe('ERROR')
  })
})

describe('Results.tryValue', () => {
  test('should return success for synchronous values', () => {
    const result = Results.tryValue(() => 42)
    Results.assertSuccess(result)
    expect(result).toBe(42)
  })

  test('should handle async promises that resolve', async () => {
    const result = await Results.tryValue(async () => 'success')
    Results.assertSuccess(result)
    expect(result).toBe('success')
  })

  test('should handle async promises that reject', async () => {
    const result = await Results.tryValue(async () => {
      throw new Error('Async error')
    })

    Results.assertFailure(result)
    expect((result as Failure<Error>).value.message).toBe('Async error')
  })

  test('should handle values that return immediately', () => {
    const result = Results.tryValue(() => 'immediate')
    Results.assertSuccess(result)
    expect(result).toBe('immediate')
  })
})

describe('Results.tryResult', () => {
  test('should catch exceptions when creating results', () => {
    const result = Results.tryResult(() => {
      throw new Error('Result error')
      // noinspection UnreachableCodeJS
      return Results.success(42)
    })

    Results.assertFailure(result)
    expect((result as Failure<Error>).value.message).toBe('Result error')
  })

  test('should return the result when no exception occurs', () => {
    const result = Results.tryResult(() => Results.success(42))

    Results.assertSuccess(result)
    expect(result).toBe(42)
  })

  test('should return failure result when no exception occurs', () => {
    const result = Results.tryResult(() => Results.failure('test error'))

    Results.assertFailure(result)
    expect((result as Failure<string>).value).toBe('test error')
  })

  test('should handle async results that resolve', async () => {
    const result = Results.tryResult(async () => Results.success(42))
    expect(result).toBeInstanceOf(Promise)
    const awaited = await result
    Results.assertSuccess(result)
    expect(awaited).toBe(42)
  })

  test('should handle async results that reject', async () => {
    const result = Results.tryResult(async () => {
      throw new Error('Async result error')
      // noinspection UnreachableCodeJS
      return Results.success(42)
    })

    expect(result).toBeInstanceOf(Promise)
    const awaited = await result
    Results.assertFailure(awaited)
    expect((awaited as Failure<Error>).value.message).toBe('Async result error')
  })
})
