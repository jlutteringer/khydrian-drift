import { Arrays } from '@bessemer/cornerstone'
import { Dictionary } from '@bessemer/cornerstone/types'

test('Arrays.first', () => {
  // Should return the first element when array has items
  expect(Arrays.first([1, 2, 3])).toBe(1)
  expect(Arrays.first(['a', 'b', 'c'])).toBe('a')
  expect(Arrays.first([true])).toBe(true)

  // Should handle objects in arrays
  const obj = { key: 'value' }
  expect(Arrays.first([obj, {}, {}])).toBe(obj)

  // Should return undefined for empty arrays
  expect(Arrays.first([])).toBeUndefined()

  // Should handle null and undefined
  expect(Arrays.first(null)).toBeUndefined()
  expect(Arrays.first(undefined)).toBeUndefined()

  // Should work with array-like objects that have a length property and numeric indices
  const arrayLike = { 0: 'zero', 1: 'one', length: 2 }
  // @ts-ignore - Testing with array-like object
  expect(Arrays.first(arrayLike)).toBe('zero')
})

test('Arrays.removeInPlace', () => {
  // Should filterInPlace all elements that match the predicate
  const numbers = [1, 2, 3, 4, 5]
  Arrays.filterInPlace(numbers, (n) => n % 2 !== 0)
  expect(numbers).toEqual([1, 3, 5])

  // Should work with objects
  const users = [
    { user: 'barney', active: false },
    { user: 'fred', active: true },
    { user: 'pebbles', active: false },
  ]
  Arrays.filterInPlace(users, (user) => user.active)
  expect(users).toEqual([{ user: 'fred', active: true }])

  // Should handle empty arrays
  const empty: number[] = []
  Arrays.filterInPlace(empty, (n) => n <= 0)
  expect(empty).toEqual([])

  // Should handle null and undefined
  // These shouldn't throw errors
  Arrays.filterInPlace(null, (n) => false)
  Arrays.filterInPlace(undefined, (n) => false)

  // Should have no effect when no elements match
  const noMatch = [1, 3, 5]
  Arrays.filterInPlace(noMatch, (n) => n % 2 !== 0)
  expect(noMatch).toEqual([1, 3, 5])

  // Should remove elements from the original array
  const fruits = ['apple', 'banana', 'cherry', 'date']
  Arrays.filterInPlace(fruits, (fruit) => !fruit.startsWith('b'))
  expect(fruits).toEqual(['apple', 'cherry', 'date'])

  // Should provide correct index in predicate
  const indexed: number[] = [10, 20, 30]
  Arrays.filterInPlace(indexed, (_, index) => index !== 1)
  expect(indexed).toEqual([10, 30])
})

test('Arrays.last', () => {
  // Should return the last element when array has items
  expect(Arrays.last([1, 2, 3])).toBe(3)
  expect(Arrays.last(['a', 'b', 'c'])).toBe('c')
  expect(Arrays.last([true])).toBe(true)

  // Should handle objects in arrays
  const obj = { key: 'value' }
  expect(Arrays.last([{}, {}, obj])).toBe(obj)

  // Should return undefined for empty arrays
  expect(Arrays.last([])).toBeUndefined()

  // Should handle null and undefined
  expect(Arrays.last(null)).toBeUndefined()
  expect(Arrays.last(undefined)).toBeUndefined()

  // Should work with array-like objects that have a length property and numeric indices
  const arrayLike = { 0: 'zero', 1: 'one', length: 2 }
  // @ts-ignore - Testing with array-like object
  expect(Arrays.last(arrayLike)).toBe('one')

  // Should handle arrays with sparse elements
  const sparse = []
  sparse[0] = 1
  sparse[2] = 3 // index 1 is empty
  expect(Arrays.last(sparse)).toBe(3)
})

test('Arrays.concatenate', () => {
  // Should concatenate arrays
  expect(Arrays.concatenate([1], [2], [3])).toEqual([1, 2, 3])
  expect(Arrays.concatenate(['a'], ['b', 'c'])).toEqual(['a', 'b', 'c'])

  // Should handle mix of arrays and values
  expect(Arrays.concatenate([1], 2, [3], 4)).toEqual([1, 2, 3, 4])
  expect(Arrays.concatenate(['a'], 'b', ['c', 'd'])).toEqual(['a', 'b', 'c', 'd'])

  // Should not modify the original array
  const original = [1, 2]
  const result = Arrays.concatenate(original, 3, 4)
  expect(original).toEqual([1, 2])
  expect(result).toEqual([1, 2, 3, 4])

  // Should handle null and undefined
  expect(Arrays.concatenate(null, [1, 2])).toEqual([])
  expect(Arrays.concatenate(undefined, [1, 2])).toEqual([])

  // Should handle empty arrays
  expect(Arrays.concatenate([], 1, 2)).toEqual([1, 2])
  expect(Arrays.concatenate([1, 2], [])).toEqual([1, 2])

  // Should handle no additional values
  expect(Arrays.concatenate([1, 2])).toEqual([1, 2])

  // Should handle objects
  const obj1 = { a: 1 }
  const obj2 = { b: 2 }
  expect(Arrays.concatenate<Dictionary<number>>([obj1], obj2)).toEqual([obj1, obj2])

  // Should flatten one level deep
  expect(Arrays.concatenate([1], [2, [3, 4]])).toEqual([1, 2, [3, 4]])
})
