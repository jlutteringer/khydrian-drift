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

describe('Maps.groupBy', () => {
  test('should group array elements by a key function', () => {
    const data = [
      { id: 1, category: 'A', name: 'Item 1' },
      { id: 2, category: 'B', name: 'Item 2' },
      { id: 3, category: 'A', name: 'Item 3' },
      { id: 4, category: 'C', name: 'Item 4' },
      { id: 5, category: 'B', name: 'Item 5' },
    ]

    const result = Maps.groupBy(data, (item) => item.category)

    expect(result.size).toBe(3)
    expect(result.get('A')).toEqual([
      { id: 1, category: 'A', name: 'Item 1' },
      { id: 3, category: 'A', name: 'Item 3' },
    ])
    expect(result.get('B')).toEqual([
      { id: 2, category: 'B', name: 'Item 2' },
      { id: 5, category: 'B', name: 'Item 5' },
    ])
    expect(result.get('C')).toEqual([{ id: 4, category: 'C', name: 'Item 4' }])
  })

  test('should handle empty iterable', () => {
    const data: Array<number> = []
    const result = Maps.groupBy(data, (n) => (n % 2 === 0 ? 'even' : 'odd'))
    expect(result.size).toBe(0)
  })

  test('should handle Set as iterable input', () => {
    const set = new Set([1, 2, 3, 4, 5])
    const result = Maps.groupBy(set, (n) => (n % 2 === 0 ? 'even' : 'odd'))

    expect(result.size).toBe(2)
    expect(result.get('even')).toEqual([2, 4])
    expect(result.get('odd')).toEqual([1, 3, 5])
  })

  test('should handle primitive values and primitive keys', () => {
    const data = [10, 20, 25, 30, 35, 40]
    const result = Maps.groupBy(data, (n) => Math.floor(n / 10) * 10)

    expect(result.size).toBe(4)
    expect(result.get(10)).toEqual([10])
    expect(result.get(20)).toEqual([20, 25])
    expect(result.get(30)).toEqual([30, 35])
    expect(result.get(40)).toEqual([40])
  })

  test('should preserve order within groups', () => {
    const data = [
      { id: 1, category: 'A', sequence: 1 },
      { id: 2, category: 'A', sequence: 2 },
      { id: 3, category: 'A', sequence: 3 },
      { id: 4, category: 'B', sequence: 1 },
      { id: 5, category: 'B', sequence: 2 },
    ]

    const result = Maps.groupBy(data, (item) => item.category)

    expect(result.get('A')?.map((item) => item.sequence)).toEqual([1, 2, 3])
    expect(result.get('B')?.map((item) => item.sequence)).toEqual([1, 2])
  })

  test('should handle mapper function returning complex key types', () => {
    interface Item {
      region: string
      subregion: string
      value: number
    }

    const data: Array<Item> = [
      { region: 'North', subregion: 'NW', value: 10 },
      { region: 'North', subregion: 'NE', value: 20 },
      { region: 'South', subregion: 'SW', value: 30 },
      { region: 'North', subregion: 'NW', value: 40 },
    ]

    // Use JSON string as complex key
    const result = Maps.groupBy(data, (item) =>
      JSON.stringify({
        region: item.region,
        subregion: item.subregion,
      })
    )

    const nwKey = JSON.stringify({ region: 'North', subregion: 'NW' })
    const neKey = JSON.stringify({ region: 'North', subregion: 'NE' })
    const swKey = JSON.stringify({ region: 'South', subregion: 'SW' })

    expect(result.size).toBe(3)
    expect(result.get(nwKey)).toEqual([
      { region: 'North', subregion: 'NW', value: 10 },
      { region: 'North', subregion: 'NW', value: 40 },
    ])
    expect(result.get(neKey)).toEqual([{ region: 'North', subregion: 'NE', value: 20 }])
    expect(result.get(swKey)).toEqual([{ region: 'South', subregion: 'SW', value: 30 }])
  })
})

describe('Maps.fuse', () => {
  test('should fuse two maps with matching keys and values', () => {
    const sourceMap = new Map([
      ['user1', 'role1'],
      ['user2', 'role2'],
      ['user3', 'role3'],
    ])

    const valuesMap = new Map([
      ['role1', { permissions: ['read'] }],
      ['role2', { permissions: ['read', 'write'] }],
      ['role3', { permissions: ['admin'] }],
    ])

    const result = Maps.fuse(sourceMap, valuesMap)

    expect(result.size).toBe(3)
    expect(result.get('user1')).toEqual({ permissions: ['read'] })
    expect(result.get('user2')).toEqual({ permissions: ['read', 'write'] })
    expect(result.get('user3')).toEqual({ permissions: ['admin'] })
  })

  test('should handle empty source map', () => {
    const sourceMap = new Map<string, string>()

    const valuesMap = new Map([
      ['role1', { permissions: ['read'] }],
      ['role2', { permissions: ['write'] }],
    ])

    const result = Maps.fuse(sourceMap, valuesMap)

    expect(result.size).toBe(0)
  })

  test('should work with primitive values', () => {
    const sourceMap = new Map([
      [1, 'A'],
      [2, 'B'],
      [3, 'C'],
    ])

    const valuesMap = new Map([
      ['A', 10],
      ['B', 20],
      ['C', 30],
    ])

    const result = Maps.fuse(sourceMap, valuesMap)

    expect(result.size).toBe(3)
    expect(result.get(1)).toBe(10)
    expect(result.get(2)).toBe(20)
    expect(result.get(3)).toBe(30)
  })

  test('should work with different key and value types', () => {
    const sourceMap = new Map<string, number>([
      ['item1', 1],
      ['item2', 2],
      ['item3', 3],
    ])

    const valuesMap = new Map<number, boolean>([
      [1, true],
      [2, false],
      [3, true],
    ])

    const result = Maps.fuse(sourceMap, valuesMap)

    expect(result.size).toBe(3)
    expect(result.get('item1')).toBe(true)
    expect(result.get('item2')).toBe(false)
    expect(result.get('item3')).toBe(true)
  })

  test('should work with complex object values', () => {
    type UserId = string
    type RoleId = string
    interface Role {
      id: RoleId
      name: string
      permissions: string[]
    }

    const userRoles = new Map<UserId, RoleId>([
      ['user1', 'role_admin'],
      ['user2', 'role_editor'],
    ])

    const roles = new Map<RoleId, Role>([
      ['role_admin', { id: 'role_admin', name: 'Administrator', permissions: ['read', 'write', 'delete'] }],
      ['role_editor', { id: 'role_editor', name: 'Editor', permissions: ['read', 'write'] }],
    ])

    const result = Maps.fuse(userRoles, roles)

    expect(result.size).toBe(2)
    expect(result.get('user1')).toEqual({
      id: 'role_admin',
      name: 'Administrator',
      permissions: ['read', 'write', 'delete'],
    })
    expect(result.get('user2')).toEqual({
      id: 'role_editor',
      name: 'Editor',
      permissions: ['read', 'write'],
    })
  })

  test('should throw when encountering missing linkage', () => {
    const sourceMap = new Map([
      ['user1', 'role1'],
      ['user2', 'role2'],
      ['user3', 'role3'], // This role doesn't exist in valuesMap
    ])

    const valuesMap = new Map([
      ['role1', { permissions: ['read'] }],
      ['role2', { permissions: ['write'] }],
    ])

    expect(() => Maps.fuse(sourceMap, valuesMap)).toThrow('Maps.fuse - Encountered missing linkage: role3')
  })

  test('should properly handle null and undefined values in source map', () => {
    // Create a map with null and undefined values
    // Note: TypeScript doesn't allow null/undefined keys in Maps by default, but JavaScript does
    const sourceMap = new Map<string, any>([
      ['key1', null],
      ['key2', undefined],
    ])

    const valuesMap = new Map<any, string>([
      [null, 'NULL_VALUE'],
      [undefined, 'UNDEFINED_VALUE'],
    ])

    const result = Maps.fuse(sourceMap, valuesMap)

    expect(result.size).toBe(2)
    expect(result.get('key1')).toBe('NULL_VALUE')
    expect(result.get('key2')).toBe('UNDEFINED_VALUE')
  })
})

describe('Maps.mapKeys', () => {
  test('should transform map keys using the mapper function', () => {
    const map = new Map([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ])

    const result = Maps.mapKeys(map, (key) => key.toUpperCase())

    expect(result.size).toBe(3)
    expect(result.get('A')).toBe(1)
    expect(result.get('B')).toBe(2)
    expect(result.get('C')).toBe(3)
    expect(map.get('a')).toBe(1) // Original map unchanged
  })

  test('should handle empty map', () => {
    const map = new Map<string, number>()
    const result = Maps.mapKeys(map, (key) => key.toUpperCase())

    expect(result.size).toBe(0)
  })

  test('should handle numeric keys', () => {
    const map = new Map([
      [1, 'one'],
      [2, 'two'],
      [3, 'three'],
    ])

    const result = Maps.mapKeys(map, (key) => key * 10)

    expect(result.size).toBe(3)
    expect(result.get(10)).toBe('one')
    expect(result.get(20)).toBe('two')
    expect(result.get(30)).toBe('three')
  })

  test('should handle object keys', () => {
    const keyObj1 = { id: 1 }
    const keyObj2 = { id: 2 }

    const map = new Map([
      [keyObj1, 'value1'],
      [keyObj2, 'value2'],
    ])

    const result = Maps.mapKeys(map, (key) => key.id)

    expect(result.size).toBe(2)
    expect(result.get(1)).toBe('value1')
    expect(result.get(2)).toBe('value2')
  })

  test('should handle complex transformations', () => {
    const map = new Map([
      ['user:1', { name: 'Alice', age: 30 }],
      ['user:2', { name: 'Bob', age: 25 }],
      ['admin:1', { name: 'Charlie', age: 40 }],
    ])

    const result = Maps.mapKeys(map, (key) => {
      const [role, id] = key.split(':')
      return { role, id: Number(id) }
    })

    // Since objects as keys are compared by reference, we need to search by matching properties
    const entries = Array.from(result.entries())

    const userEntry1 = entries.find(([k]) => k.role === 'user' && k.id === 1)
    const userEntry2 = entries.find(([k]) => k.role === 'user' && k.id === 2)
    const adminEntry = entries.find(([k]) => k.role === 'admin' && k.id === 1)

    expect(entries.length).toBe(3)
    expect(userEntry1?.[1]).toEqual({ name: 'Alice', age: 30 })
    expect(userEntry2?.[1]).toEqual({ name: 'Bob', age: 25 })
    expect(adminEntry?.[1]).toEqual({ name: 'Charlie', age: 40 })
  })

  test('should handle key collisions by throwing', () => {
    const map = new Map([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ])

    expect(() => Maps.mapKeys(map, () => 'same-key')).toThrow()
  })

  test('should work with different key type transformations', () => {
    const map = new Map<string, number>([
      ['1', 100],
      ['2', 200],
      ['3', 300],
    ])

    const result = Maps.mapKeys(map, (key) => parseInt(key))

    expect(result.size).toBe(3)
    expect(result.get(1)).toBe(100)
    expect(result.get(2)).toBe(200)
    expect(result.get(3)).toBe(300)
  })

  test('should be able to use complex objects as new keys', () => {
    const map = new Map<number, string>([
      [1, 'Alice'],
      [2, 'Bob'],
    ])

    const result = Maps.mapKeys(map, (id) => ({ id, active: true }))

    // Need to search by reference since objects as keys are compared by reference
    const entries = Array.from(result.entries())

    expect(entries.length).toBe(2)

    const aliceEntry = entries.find(([key]) => key.id === 1)
    const bobEntry = entries.find(([key]) => key.id === 2)

    expect(aliceEntry?.[0]).toEqual({ id: 1, active: true })
    expect(aliceEntry?.[1]).toBe('Alice')

    expect(bobEntry?.[0]).toEqual({ id: 2, active: true })
    expect(bobEntry?.[1]).toBe('Bob')
  })
})

describe('Maps.collectKeys', () => {
  test('should collect items using provided mapper function', () => {
    const items = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
    ]

    const result = Maps.collectKeys(items, (item) => item.id)

    expect(result.size).toBe(3)
    expect(result.get(1)).toEqual({ id: 1, name: 'Alice' })
    expect(result.get(2)).toEqual({ id: 2, name: 'Bob' })
    expect(result.get(3)).toEqual({ id: 3, name: 'Charlie' })
  })

  test('should collect signable items without a mapper function at all', () => {
    const items = [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
      { id: '3', name: 'Charlie' },
    ]

    const result = Maps.collectKeys(items)

    expect(result.size).toBe(3)
    expect(result.get('1')).toEqual({ id: '1', name: 'Alice' })
    expect(result.get('2')).toEqual({ id: '2', name: 'Bob' })
    expect(result.get('3')).toEqual({ id: '3', name: 'Charlie' })
  })

  test('should handle empty iterable with mapper', () => {
    const items: Array<{ id: number; name: string }> = []
    const result = Maps.collectKeys(items, (item) => item.id)

    expect(result.size).toBe(0)
  })

  test('should handle complex key mappings', () => {
    const items = [
      { id: 1, type: 'user', region: 'US' },
      { id: 2, type: 'admin', region: 'EU' },
      { id: 3, type: 'user', region: 'APAC' },
    ]

    const result = Maps.collectKeys(items, (item) => `${item.type}:${item.region}`)

    expect(result.size).toBe(3)
    expect(result.get('user:US')).toEqual({ id: 1, type: 'user', region: 'US' })
    expect(result.get('admin:EU')).toEqual({ id: 2, type: 'admin', region: 'EU' })
    expect(result.get('user:APAC')).toEqual({ id: 3, type: 'user', region: 'APAC' })
  })
})

describe('Maps.collectValues', () => {
  test('should collect values from iterable using mapper function', () => {
    const items = ['apple', 'banana', 'cherry']
    const result = Maps.collectValues(items, (item) => item.length)

    expect(result.size).toBe(3)
    expect(result.get('apple')).toBe(5)
    expect(result.get('banana')).toBe(6)
    expect(result.get('cherry')).toBe(6)
  })

  test('should handle empty iterable', () => {
    const items: string[] = []
    const result = Maps.collectValues(items, (item) => item.length)

    expect(result.size).toBe(0)
  })

  test('should work with complex object values', () => {
    const items = [1, 2, 3]

    const result = Maps.collectValues(items, (num) => ({
      value: num,
      square: num * num,
      cube: num * num * num,
    }))

    expect(result.size).toBe(3)
    expect(result.get(1)).toEqual({ value: 1, square: 1, cube: 1 })
    expect(result.get(2)).toEqual({ value: 2, square: 4, cube: 8 })
    expect(result.get(3)).toEqual({ value: 3, square: 9, cube: 27 })
  })

  test('should throw on duplicate collection values', () => {
    // Using Set to ensure we don't have duplicate references
    const items = new Set([
      { id: 1 },
      { id: 1 }, // This is a different object reference with same structure
    ])

    // This will fail as object equality in Maps uses reference identity
    // and each item in the Set is a unique reference
    expect(() => Maps.collectValues(Array.from(items), (item) => item.id)).not.toThrow()

    // Now let's create actual duplicate values
    const obj = { id: 1 }
    const duplicates = [obj, obj] // Same reference twice

    // This should throw because we have the same object twice
    expect(() => Maps.collectValues(duplicates, (item) => item.id)).toThrow('Maps.mapValues - Encountered illegal duplicate collection value:')
  })

  test('should work with object keys', () => {
    const obj1 = { id: 1, name: 'Alice' }
    const obj2 = { id: 2, name: 'Bob' }
    const obj3 = { id: 3, name: 'Charlie' }

    const items = [obj1, obj2, obj3]

    const result = Maps.collectValues(items, (item) => item.name.toUpperCase())

    expect(result.size).toBe(3)
    expect(result.get(obj1)).toBe('ALICE')
    expect(result.get(obj2)).toBe('BOB')
    expect(result.get(obj3)).toBe('CHARLIE')
  })

  test('should handle null and undefined values', () => {
    const items = ['a', 'b', 'c']

    const result = Maps.collectValues(items, (item) => {
      if (item === 'a') return null
      if (item === 'b') return undefined
      return 'value'
    })

    expect(result.size).toBe(3)
    expect(result.get('a')).toBeNull()
    expect(result.get('b')).toBeUndefined()
    expect(result.get('c')).toBe('value')
  })

  test('should handle mapper function that uses item index', () => {
    const items = ['item1', 'item2', 'item3']
    let index = 0

    const result = Maps.collectValues(items, () => index++)

    expect(result.size).toBe(3)
    expect(result.get('item1')).toBe(0)
    expect(result.get('item2')).toBe(1)
    expect(result.get('item3')).toBe(2)
  })
})

describe('Maps.collect', () => {
  test('should collect items into a map using mapEntry function', () => {
    const items = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' },
    ]

    const result = Maps.collect(
      items,
      (item) => [item.id, item.name],
      (_, first, _second) => first // Keep first value on collision (doesn't matter for this test)
    )

    expect(result.size).toBe(3)
    expect(result.get(1)).toBe('Alice')
    expect(result.get(2)).toBe('Bob')
    expect(result.get(3)).toBe('Charlie')
  })

  test('should handle empty iterable', () => {
    const items: Array<any> = []

    const result = Maps.collect(
      items,
      (item) => [item.id, item.name],
      (_, first, _second) => first
    )

    expect(result.size).toBe(0)
  })

  test('should use reducer function to handle key collisions - keep first value', () => {
    const items = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 1, name: 'Charlie' }, // Duplicate key
    ]

    const result = Maps.collect(
      items,
      (item) => [item.id, item.name],
      (_, first, _second) => first // Keep first value on collision
    )

    expect(result.size).toBe(2)
    expect(result.get(1)).toBe('Alice') // First value kept
    expect(result.get(2)).toBe('Bob')
  })

  test('should use reducer function to handle key collisions - keep last value', () => {
    const items = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 1, name: 'Charlie' }, // Duplicate key
    ]

    const result = Maps.collect(
      items,
      (item) => [item.id, item.name],
      (_, first, second) => second // Keep last value on collision
    )

    expect(result.size).toBe(2)
    expect(result.get(1)).toBe('Charlie') // Last value kept
    expect(result.get(2)).toBe('Bob')
  })

  test('should use reducer function to combine values on collision', () => {
    const items = [
      { id: 1, count: 5 },
      { id: 2, count: 10 },
      { id: 1, count: 3 }, // Duplicate key
      { id: 1, count: 2 }, // Another duplicate
    ]

    const result = Maps.collect(
      items,
      (item) => [item.id, item.count],
      (_, first, second) => first + second // Sum values on collision
    )

    expect(result.size).toBe(2)
    expect(result.get(1)).toBe(10) // 5 + 3 + 2
    expect(result.get(2)).toBe(10)
  })

  test('should work with complex key and value types', () => {
    interface Role {
      name: string
      permissions: string[]
    }

    const items = [
      { userId: 1, role: { name: 'admin', permissions: ['read', 'write'] } },
      { userId: 2, role: { name: 'user', permissions: ['read'] } },
      { userId: 1, role: { name: 'editor', permissions: ['read', 'edit'] } },
    ]

    const result = Maps.collect<any, number, Role[]>(
      items,
      (item) => [item.userId, [item.role]],
      (_, first, second) => [...first, ...second] // Combine role arrays
    )

    expect(result.size).toBe(2)
    expect(result.get(1)).toEqual([
      { name: 'admin', permissions: ['read', 'write'] },
      { name: 'editor', permissions: ['read', 'edit'] },
    ])
    expect(result.get(2)).toEqual([{ name: 'user', permissions: ['read'] }])
  })

  test('should handle Map entries as input', () => {
    const map = new Map<string, number>([
      ['a', 1],
      ['b', 2],
      ['c', 3],
    ])

    // Create a new map with uppercase keys and doubled values
    const result = Maps.collect(
      map.entries(),
      ([key, value]) => [key.toUpperCase(), value * 2],
      (_, first, second) => first + second // Sum on collision (not used in this test)
    )

    expect(result.size).toBe(3)
    expect(result.get('A')).toBe(2)
    expect(result.get('B')).toBe(4)
    expect(result.get('C')).toBe(6)
  })

  test('should work with non-primitive keys', () => {
    const keyObj1 = { type: 'user' }
    const keyObj2 = { type: 'admin' }

    const items = [
      { key: keyObj1, value: 'User data' },
      { key: keyObj2, value: 'Admin data' },
    ]

    const result = Maps.collect(
      items,
      (item) => [item.key, item.value],
      (_, first, second) => `${first}, ${second}` // Combine strings on collision
    )

    expect(result.size).toBe(2)
    expect(result.get(keyObj1)).toBe('User data')
    expect(result.get(keyObj2)).toBe('Admin data')
  })

  test('should work with reducer that uses the key', () => {
    const items = [
      { category: 'fruit', item: 'apple' },
      { category: 'vegetable', item: 'carrot' },
      { category: 'fruit', item: 'banana' },
      { category: 'fruit', item: 'cherry' },
      { category: 'vegetable', item: 'potato' },
    ]

    const result = Maps.collect(
      items,
      (item) => [item.category, [item.item]],
      (key, first, second) => {
        // If it's fruit, just keep first 2 items
        if (key === 'fruit' && first.length >= 2) {
          return first
        }
        // Otherwise combine arrays
        return [...first, ...second]
      }
    )

    expect(result.size).toBe(2)
    expect(result.get('fruit')).toEqual(['apple', 'banana']) // Cherry was ignored
    expect(result.get('vegetable')).toEqual(['carrot', 'potato'])
  })

  test('should handle recursive data structures with reducer', () => {
    interface NestedData {
      value: number
      children?: NestedData[]
    }

    const items: Array<[string, NestedData]> = [
      ['root', { value: 1, children: [{ value: 11 }, { value: 12 }] }],
      ['root', { value: 2, children: [{ value: 21 }] }],
      ['branch', { value: 3 }],
    ]

    const result = Maps.collect<[string, NestedData], string, NestedData>(
      items,
      ([key, data]) => [key, data],
      (_, first, second) => {
        return {
          value: first.value + second.value,
          children: [...(first.children || []), ...(second.children || [])],
        }
      }
    )

    expect(result.size).toBe(2)
    expect(result.get('root')).toEqual({
      value: 3, // 1 + 2
      children: [{ value: 11 }, { value: 12 }, { value: 21 }],
    })
    expect(result.get('branch')).toEqual({ value: 3 })
  })

  test('should work with various iterable types', () => {
    // Test with a Set
    const set = new Set(['a', 'b', 'c'])

    const resultFromSet = Maps.collect(
      set,
      (item) => [item, item.toUpperCase()],
      (_, first, _second) => first // Not used
    )

    expect(resultFromSet.size).toBe(3)
    expect(resultFromSet.get('a')).toBe('A')
    expect(resultFromSet.get('b')).toBe('B')
    expect(resultFromSet.get('c')).toBe('C')

    // Test with a generator function
    function* generateItems() {
      yield 1
      yield 2
      yield 3
    }

    const resultFromGenerator = Maps.collect(
      generateItems(),
      (item) => [item, item * 10],
      (_, first, _second) => first // Not used
    )

    expect(resultFromGenerator.size).toBe(3)
    expect(resultFromGenerator.get(1)).toBe(10)
    expect(resultFromGenerator.get(2)).toBe(20)
    expect(resultFromGenerator.get(3)).toBe(30)
  })
})
