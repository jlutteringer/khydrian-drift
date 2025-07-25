import { Arrays, Comparators, Equalitors } from '@bessemer/cornerstone'
import { Dictionary } from '@bessemer/cornerstone/types'
import { Equalitor } from '@bessemer/cornerstone/equalitor'

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

test('Arrays.sortWith', () => {
  // Should sort numbers in ascending order
  const numbers = [3, 1, 4, 1, 5]
  expect(Arrays.sortWith(numbers, Comparators.natural())).toEqual([1, 1, 3, 4, 5])

  // Should sort numbers in descending order
  expect(Arrays.sortWith(numbers, Comparators.reverse(Comparators.natural()))).toEqual([5, 4, 3, 1, 1])

  // Should sort strings alphabetically
  const strings = ['charlie', 'alice', 'bob']
  expect(Arrays.sortWith(strings, Comparators.natural())).toEqual(['alice', 'bob', 'charlie'])

  // Should sort strings in reverse alphabetical order
  expect(Arrays.sortWith(strings, Comparators.reverse(Comparators.natural()))).toEqual(['charlie', 'bob', 'alice'])

  // Should sort objects by property
  const users = [
    { name: 'John', age: 30 },
    { name: 'Jane', age: 25 },
    { name: 'Bob', age: 35 },
  ]
  expect(Arrays.sortWith(users, (a, b) => a.age - b.age)).toEqual([
    { name: 'Jane', age: 25 },
    { name: 'John', age: 30 },
    { name: 'Bob', age: 35 },
  ])

  // Should not modify the original array
  const original = [3, 1, 2]
  const sorted = Arrays.sortWith(original, (a, b) => a - b)
  expect(original).toEqual([3, 1, 2])
  expect(sorted).toEqual([1, 2, 3])

  // Should handle empty arrays
  expect(Arrays.sortWith([], (a, b) => a - b)).toEqual([])

  // Should handle single element arrays
  expect(Arrays.sortWith([42], (a, b) => a - b)).toEqual([42])

  // Should handle arrays with duplicate elements
  const duplicates = [1, 3, 2, 3, 1]
  expect(Arrays.sortWith(duplicates, (a, b) => a - b)).toEqual([1, 1, 2, 3, 3])
})

test('Arrays.sortBy', () => {
  {
    // Should sort by mapped value using natural comparator
    const users = [
      { name: 'Charlie', age: 30 },
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 35 },
    ]
    expect(Arrays.sortBy(users, (user) => user.name)).toEqual([
      { name: 'Alice', age: 25 },
      { name: 'Bob', age: 35 },
      { name: 'Charlie', age: 30 },
    ])

    // Should sort by age using natural comparator
    expect(Arrays.sortBy(users, (user) => user.age)).toEqual([
      { name: 'Alice', age: 25 },
      { name: 'Charlie', age: 30 },
      { name: 'Bob', age: 35 },
    ])
  }

  {
    // Should sort by custom mapper with custom comparator
    const items = [
      { value: 'apple', length: 5 },
      { value: 'banana', length: 6 },
      { value: 'cherry', length: 6 },
      { value: 'date', length: 4 },
    ]
    expect(
      Arrays.sortBy(
        items,
        (item) => item.value,
        (a, b) => a.length - b.length
      )
    ).toEqual([
      { value: 'date', length: 4 },
      { value: 'apple', length: 5 },
      { value: 'banana', length: 6 },
      { value: 'cherry', length: 6 },
    ])
  }

  {
    // Should sort strings by length using custom comparator
    const words = ['elephant', 'cat', 'dog', 'butterfly']
    expect(
      Arrays.sortBy(
        words,
        (word) => word,
        (a, b) => a.length - b.length
      )
    ).toEqual(['cat', 'dog', 'elephant', 'butterfly'])
  }

  {
    // Should sort numbers in descending order with custom comparator
    const numbers = [1, 5, 3, 9, 2]
    expect(Arrays.sortBy(numbers, (n) => n, Comparators.reverse(Comparators.natural()))).toEqual([9, 5, 3, 2, 1])
  }

  {
    // Should not modify the original array
    const original = [{ id: 3 }, { id: 1 }, { id: 2 }]
    const sorted = Arrays.sortBy(original, (item) => item.id)
    expect(original).toEqual([{ id: 3 }, { id: 1 }, { id: 2 }])
    expect(sorted).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }])
  }

  // Should handle empty arrays
  expect(Arrays.sortBy([], (x) => x)).toEqual([])

  // Should handle single element arrays
  expect(Arrays.sortBy([{ value: 42 }], (item) => item.value)).toEqual([{ value: 42 }])

  {
    // Should handle arrays with duplicate mapped values
    const duplicates = [
      { name: 'John', category: 'A' },
      { name: 'Jane', category: 'B' },
      { name: 'Bob', category: 'A' },
    ]
    const sorted = Arrays.sortBy(duplicates, (item) => item.category)
    expect(sorted.filter((item) => item.category === 'A')).toHaveLength(2)
    expect(sorted.filter((item) => item.category === 'B')).toHaveLength(1)
    expect(sorted[0]?.category).toBe('A')
    expect(sorted[1]?.category).toBe('A')
    expect(sorted[2]?.category).toBe('B')
  }

  {
    // Should work with boolean values
    const booleans = [
      { active: true, name: 'active1' },
      { active: false, name: 'inactive1' },
      { active: true, name: 'active2' },
    ]
    expect(Arrays.sortBy(booleans, (item) => item.active)).toEqual([
      { active: false, name: 'inactive1' },
      { active: true, name: 'active1' },
      { active: true, name: 'active2' },
    ])
  }
})

test('Arrays.sort', () => {
  // Should sort numbers in ascending order
  expect(Arrays.sort([3, 1, 4, 1, 5])).toEqual([1, 1, 3, 4, 5])

  // Should sort strings alphabetically
  expect(Arrays.sort(['charlie', 'alice', 'bob'])).toEqual(['alice', 'bob', 'charlie'])

  // Should sort boolean values
  expect(Arrays.sort([true, false, true])).toEqual([false, true, true])

  {
    // Should not modify the original array
    const original = [3, 1, 2]
    const sorted = Arrays.sort(original)
    expect(original).toEqual([3, 1, 2])
    expect(sorted).toEqual([1, 2, 3])
  }

  // Should handle empty arrays
  expect(Arrays.sort([])).toEqual([])

  // Should handle single element arrays
  expect(Arrays.sort([42])).toEqual([42])

  // Should handle arrays with duplicate elements
  expect(Arrays.sort([1, 3, 2, 3, 1])).toEqual([1, 1, 2, 3, 3])

  // Should handle negative numbers
  expect(Arrays.sort([-3, -1, -2, 0, 1])).toEqual([-3, -2, -1, 0, 1])

  // Should handle floating point numbers
  expect(Arrays.sort([3.14, 2.71, 1.41, 1.73])).toEqual([1.41, 1.73, 2.71, 3.14])

  // Should handle string edge cases
  expect(Arrays.sort(['', 'a', 'A', '1', '10', '2'])).toEqual(['', '1', '10', '2', 'a', 'A'])
})

test('Arrays.equalWith', () => {
  // Should return true for identical arrays
  expect(Arrays.equalWith([1, 2, 3], [1, 2, 3], Equalitors.natural())).toBe(true)

  // Should return false for arrays with different lengths
  expect(Arrays.equalWith([1, 2, 3], [1, 2, 3, 4], Equalitors.natural())).toBe(false)

  // Should return false for arrays with same values but different order
  expect(Arrays.equalWith([1, 2, 3], [3, 2, 1], Equalitors.natural())).toBe(false)

  // Should work with custom equalitor for objects
  const users = [
    { name: 'Alice', id: 1 },
    { name: 'Bob', id: 2 },
  ]
  const sameUsers = [
    { name: 'Alice', id: 1 },
    { name: 'Bob', id: 2 },
  ]
  const differentUsers = [
    { name: 'Alice', id: 1 },
    { name: 'Charlie', id: 3 },
  ]

  const idEqualitor: Equalitor<{ id: number }> = (a, b) => a.id === b.id
  expect(Arrays.equalWith(users, sameUsers, idEqualitor)).toBe(true)
  expect(Arrays.equalWith(users, differentUsers, idEqualitor)).toBe(false)

  // Should handle empty arrays
  expect(Arrays.equalWith([], [], Equalitors.natural())).toBe(true)
})

test('Arrays.equalBy', () => {
  // Test objects
  const users = [
    { name: 'Alice', id: 1, active: true },
    { name: 'Bob', id: 2, active: false },
  ]
  const sameIdUsers = [
    { name: 'Alice2', id: 1, active: true },
    { name: 'Bob2', id: 2, active: true },
  ]
  const differentIdUsers = [
    { name: 'Alice', id: 1, active: true },
    { name: 'Charlie', id: 3, active: false },
  ]

  // Should compare by mapped property with default equality
  expect(Arrays.equalBy(users, sameIdUsers, (user) => user.id)).toBe(true)
  expect(Arrays.equalBy(users, differentIdUsers, (user) => user.id)).toBe(false)

  // Should compare using mapper and custom equalitor
  const customEqualitor: Equalitor<boolean> = (a, b) => true // Always equal
  expect(Arrays.equalBy(users, differentIdUsers, (user) => user.active, customEqualitor)).toBe(true)

  // Should handle arrays of different lengths
  const longerArray = [...users, { name: 'Dan', id: 4, active: true }]
  expect(Arrays.equalBy(users, longerArray, (user) => user.id)).toBe(false)

  // Should work with primitive arrays
  expect(Arrays.equalBy([1, 2, 3], [1, 2, 3], (n) => n.toString())).toBe(true)
  expect(Arrays.equalBy([1, 2, 3], [1, 2, 4], (n) => n.toString())).toBe(false)
})

test('Arrays.equal', () => {
  // Should work with primitive values
  expect(Arrays.equal([1, 2, 3], [1, 2, 3])).toBe(true)
  expect(Arrays.equal([1, 2, 3], [1, 2, 4])).toBe(false)
  expect(Arrays.equal(['a', 'b'], ['a', 'b'])).toBe(true)
  expect(Arrays.equal(['a', 'b'], ['a', 'c'])).toBe(false)

  // Should work with objects that have an id property
  const objA = { id: '1', value: 'first' }
  const objB = { id: '2', value: 'second' }
  const objC = { id: '1', value: 'different value but same id' }

  expect(Arrays.equal([objA, objB], [objA, objB])).toBe(true)
  expect(Arrays.equal([objA, objB], [objA, objC])).toBe(false)
  expect(Arrays.equal([objA, objB], [objC, objB])).toBe(true) // objA and objC have same id

  // Should handle empty arrays
  expect(Arrays.equal([], [])).toBe(true)
})

test('Arrays.differenceWith', () => {
  // Should return elements from first array not in second array
  expect(Arrays.differenceWith([1, 2, 3, 4, 5], [2, 3], Equalitors.natural())).toEqual([1, 4, 5])

  // Should return empty array when arrays are identical
  expect(Arrays.differenceWith([1, 2, 3], [1, 2, 3], Equalitors.natural())).toEqual([])

  // Should handle custom equalitor for objects
  const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' },
    { id: 4, name: 'Dave' },
  ]

  const usersToRemove = [
    { id: 2, name: 'Different Name' }, // Same id as Bob
    { id: 3, name: 'Charlie' },
  ]

  const idEqualitor: Equalitor<{ id: number }> = (a, b) => a.id === b.id

  expect(Arrays.differenceWith(users, usersToRemove, idEqualitor)).toEqual([
    { id: 1, name: 'Alice' },
    { id: 4, name: 'Dave' },
  ])

  // Should handle empty arrays
  expect(Arrays.differenceWith([], [1, 2, 3], Equalitors.natural())).toEqual([])
  expect(Arrays.differenceWith([1, 2, 3], [], Equalitors.natural())).toEqual([1, 2, 3])
})

test('Arrays.differenceBy', () => {
  // Test data
  const users = [
    { id: 1, name: 'Alice', age: 30 },
    { id: 2, name: 'Bob', age: 25 },
    { id: 3, name: 'Charlie', age: 35 },
    { id: 4, name: 'Dave', age: 40 },
  ]

  const usersToRemove = [
    { id: 2, name: 'Different', age: 50 }, // Same id as Bob
    { id: 3, name: 'Charlie', age: 35 }, // Same as Charlie
  ]

  // Should compare using mapper with default equality
  expect(Arrays.differenceBy(users, usersToRemove, (user) => user.id)).toEqual([
    { id: 1, name: 'Alice', age: 30 },
    { id: 4, name: 'Dave', age: 40 },
  ])

  // Should handle primitive arrays with mapping
  expect(Arrays.differenceBy([1, 2, 3, 4], ['2', '3'], (n) => n.toString())).toEqual([1, 4])

  // Should handle empty arrays
  expect(Arrays.differenceBy([], [1, 2, 3], (n) => n)).toEqual([])
  expect(Arrays.differenceBy([1, 2, 3], [], (n) => n)).toEqual([1, 2, 3])
})

test('Arrays.difference', () => {
  // Should work with primitive values
  expect(Arrays.difference([1, 2, 3, 4, 5], [2, 3])).toEqual([1, 4, 5])
  expect(Arrays.difference(['a', 'b', 'c', 'd'], ['b', 'c'])).toEqual(['a', 'd'])

  // Should work with objects that have an id property
  const users = [
    { id: '1', name: 'Alice' },
    { id: '2', name: 'Bob' },
    { id: '3', name: 'Charlie' },
    { id: '4', name: 'Dave' },
  ]

  const usersToRemove = [
    { id: '2', name: 'Different name' }, // Same id as Bob
    { id: '3', name: 'Charlie' }, // Same as Charlie
  ]

  expect(Arrays.difference(users, usersToRemove)).toEqual([
    { id: '1', name: 'Alice' },
    { id: '4', name: 'Dave' },
  ])

  // Should handle empty arrays
  expect(Arrays.difference([], [1, 2, 3])).toEqual([])
  expect(Arrays.difference([1, 2, 3], [])).toEqual([1, 2, 3])
})
