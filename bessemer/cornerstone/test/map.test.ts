import { Maps } from '@bessemer/cornerstone'

describe('Maps.append', () => {
  test('should append single entry to empty map', () => {
    const map = new Map()
    const result = Maps.append(map, ['key1', 'value1'])

    expect(result.size).toBe(1)
    expect(result.get('key1')).toBe('value1')
    expect(map.size).toBe(0) // original map unchanged
  })

  test('should append multiple entries to map', () => {
    const map = new Map([['existing', 'value']])
    const result = Maps.append(map, ['key1', 'value1'], ['key2', 'value2'])

    expect(result.size).toBe(3)
    expect(result.get('existing')).toBe('value')
    expect(result.get('key1')).toBe('value1')
    expect(result.get('key2')).toBe('value2')
  })

  test('should throw when attempting to overwrite existing keys', () => {
    const map = new Map([['key1', 'original']])
    expect(() => Maps.append(map, ['key1', 'updated'])).toThrow()
  })

  test('should handle no additional entries', () => {
    const map = new Map([['key1', 'value1']])
    const result = Maps.append(map)

    expect(result.size).toBe(1)
    expect(result.get('key1')).toBe('value1')
    expect(result).not.toBe(map) // should be a new map
  })
})

describe('Maps.concatenate', () => {
  test('should concatenate empty maps', () => {
    const map1 = new Map()
    const map2 = new Map()
    const result = Maps.concatenate(map1, map2)

    expect(result.size).toBe(0)
  })

  test('should concatenate maps with unique keys', () => {
    const map1 = new Map([
      ['a', 1],
      ['b', 2],
    ])
    const map2 = new Map([
      ['c', 3],
      ['d', 4],
    ])
    const result = Maps.concatenate(map1, map2)

    expect(result.size).toBe(4)
    expect(result.get('a')).toBe(1)
    expect(result.get('b')).toBe(2)
    expect(result.get('c')).toBe(3)
    expect(result.get('d')).toBe(4)
  })

  test('should throw with duplicate keys', () => {
    const map1 = new Map([
      ['a', 1],
      ['b', 2],
    ])
    const map2 = new Map([
      ['b', 20],
      ['c', 3],
    ])
    const map3 = new Map([['a', 100]])
    expect(() => Maps.concatenate(map1, map2, map3)).toThrow()
  })

  test('should not modify original maps', () => {
    const map1 = new Map([['a', 1]])
    const map2 = new Map([['b', 2]])
    const result = Maps.concatenate(map1, map2)

    expect(map1.size).toBe(1)
    expect(map2.size).toBe(1)
    expect(result.size).toBe(2)
  })

  test('should handle multiple maps', () => {
    const map1 = new Map([['a', 1]])
    const map2 = new Map([['b', 2]])
    const map3 = new Map([['c', 3]])
    const map4 = new Map([['d', 4]])
    const result = Maps.concatenate(map1, map2, map3, map4)

    expect(result.size).toBe(4)
    expect(Array.from(result.entries())).toEqual([
      ['a', 1],
      ['b', 2],
      ['c', 3],
      ['d', 4],
    ])
  })
})

describe('Maps.filterFrom', () => {
  test('should filter entries from map in place', () => {
    const map = new Map([
      ['a', 1],
      ['b', 2],
      ['c', 3],
      ['d', 4],
    ])
    Maps.filterFrom(map, ([_, value]) => value % 2 === 0)

    expect(map.size).toBe(2)
    expect(map.get('a')).toBeUndefined()
    expect(map.get('b')).toBe(2)
    expect(map.get('c')).toBeUndefined()
    expect(map.get('d')).toBe(4)
  })

  test('should filter based on keys', () => {
    const map = new Map([
      ['apple', 1],
      ['banana', 2],
      ['cherry', 3],
    ])
    Maps.filterFrom(map, ([key, _]) => key.startsWith('a'))

    expect(map.size).toBe(1)
    expect(map.get('apple')).toBe(1)
    expect(map.get('banana')).toBeUndefined()
    expect(map.get('cherry')).toBeUndefined()
  })

  test('should handle empty map', () => {
    const map = new Map()
    Maps.filterFrom(map, () => true)

    expect(map.size).toBe(0)
  })

  test('should remove all entries when predicate always returns false', () => {
    const map = new Map([
      ['a', 1],
      ['b', 2],
    ])
    Maps.filterFrom(map, () => false)

    expect(map.size).toBe(0)
  })

  test('should keep all entries when predicate always returns true', () => {
    const map = new Map([
      ['a', 1],
      ['b', 2],
    ])
    Maps.filterFrom(map, () => true)

    expect(map.size).toBe(2)
    expect(map.get('a')).toBe(1)
    expect(map.get('b')).toBe(2)
  })

  test('should filter with complex predicate', () => {
    const map = new Map([
      ['user1', { name: 'Alice', age: 25 }],
      ['user2', { name: 'Bob', age: 30 }],
      ['user3', { name: 'Charlie', age: 35 }],
    ])

    Maps.filterFrom(map, ([_, value]) => value.age >= 30)

    expect(map.size).toBe(2)
    expect(map.get('user1')).toBeUndefined()
    expect(map.get('user2')).toEqual({ name: 'Bob', age: 30 })
    expect(map.get('user3')).toEqual({ name: 'Charlie', age: 35 })
  })
})

describe('Maps.map', () => {
  test('should transform entries', () => {
    const map = new Map([
      ['a', 1],
      ['b', 2],
    ])
    const result = Maps.map(map, ([key, value]) => [key.toUpperCase(), value * 2])

    expect(result.size).toBe(2)
    expect(result.get('A')).toBe(2)
    expect(result.get('B')).toBe(4)
    expect(map.size).toBe(2) // original unchanged
  })

  test('should handle empty map', () => {
    const map = new Map()
    const result = Maps.map(map, ([key, value]) => [key, value])

    expect(result.size).toBe(0)
  })

  test('should transform keys and values independently', () => {
    const map = new Map([
      [1, 'one'],
      [2, 'two'],
    ])
    const result = Maps.map(map, ([key, value]) => [`key_${key}`, value.toUpperCase()])

    expect(result.size).toBe(2)
    expect(result.get('key_1')).toBe('ONE')
    expect(result.get('key_2')).toBe('TWO')
  })
})

describe('Maps.mapValues', () => {
  test('should transform only values', () => {
    const map = new Map([
      ['a', 1],
      ['b', 2],
    ])
    const result = Maps.mapValues(map, (value) => value * 2)

    expect(result.size).toBe(2)
    expect(result.get('a')).toBe(2)
    expect(result.get('b')).toBe(4)
  })

  test('should preserve keys unchanged', () => {
    const map = new Map([
      ['key1', 'value1'],
      ['key2', 'value2'],
    ])
    const result = Maps.mapValues(map, (value) => value.toUpperCase())

    expect(result.size).toBe(2)
    expect(result.get('key1')).toBe('VALUE1')
    expect(result.get('key2')).toBe('VALUE2')
  })

  test('should handle complex value transformations', () => {
    const map = new Map([
      ['user1', { name: 'Alice', age: 25 }],
      ['user2', { name: 'Bob', age: 30 }],
    ])
    const result = Maps.mapValues(map, (user) => ({ ...user, age: user.age + 1 }))

    expect(result.get('user1')).toEqual({ name: 'Alice', age: 26 })
    expect(result.get('user2')).toEqual({ name: 'Bob', age: 31 })
  })
})

describe('Maps.filter', () => {
  test('should return new map with filtered entries', () => {
    const map = new Map([
      ['a', 1],
      ['b', 2],
      ['c', 3],
      ['d', 4],
    ])
    const result = Maps.filter(map, ([_, value]) => value % 2 === 0)

    expect(result.size).toBe(2)
    expect(result.get('b')).toBe(2)
    expect(result.get('d')).toBe(4)
    expect(map.size).toBe(4) // original unchanged
  })

  test('should return empty map when no matches', () => {
    const map = new Map([
      ['a', 1],
      ['b', 3],
    ])
    const result = Maps.filter(map, ([_, value]) => value % 2 === 0)

    expect(result.size).toBe(0)
  })

  test('should return copy when all match', () => {
    const map = new Map([
      ['a', 2],
      ['b', 4],
    ])
    const result = Maps.filter(map, ([_, value]) => value % 2 === 0)

    expect(result.size).toBe(2)
    expect(result.get('a')).toBe(2)
    expect(result.get('b')).toBe(4)
    expect(result).not.toBe(map)
  })
})
