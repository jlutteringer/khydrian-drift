import { ObjectPaths } from '@bessemer/cornerstone'

describe('ObjectPaths.of', () => {
  test('should create ObjectPath from string', () => {
    expect(ObjectPaths.of('user.name')).toBe('user.name')
    expect(ObjectPaths.of('name')).toBe('name')
    expect(ObjectPaths.of('user.profile.name')).toBe('user.profile.name')
    expect(ObjectPaths.of('users[0]')).toBe('users[0]')
    expect(ObjectPaths.of('users[0].profile.tags[2]')).toBe('users[0].profile.tags[2]')
  })
})

describe('ObjectPaths.fromString', () => {
  test('should parse valid simple property path', () => {
    const path = ObjectPaths.fromString('name')
    expect(path).toBe('name')
  })

  test('should parse valid nested property path', () => {
    const path = ObjectPaths.fromString('user.profile.name')
    expect(path).toBe('user.profile.name')
  })

  test('should parse valid array index path', () => {
    const path = ObjectPaths.fromString('items[0]')
    expect(path).toBe('items[0]')
  })

  test('should parse valid mixed path', () => {
    const path = ObjectPaths.fromString('users[0].profile.tags[2].name')
    expect(path).toBe('users[0].profile.tags[2].name')
  })

  test('should parse path with underscores and dollar signs', () => {
    const path = ObjectPaths.fromString('_private.$special.user_data')
    expect(path).toBe('_private.$special.user_data')
  })

  test('should parse path with multiple array indices', () => {
    const path = ObjectPaths.fromString('matrix[0][1][2]')
    expect(path).toBe('matrix[0][1][2]')
  })

  test('should throw for invalid path starting with number', () => {
    expect(() => ObjectPaths.fromString('123invalid')).toThrow()
  })

  test('should throw for path with trailing dot', () => {
    expect(() => ObjectPaths.fromString('user.name.')).toThrow()
  })

  test('should throw for path starting with dot', () => {
    expect(() => ObjectPaths.fromString('.user.name')).toThrow()
  })

  test('should throw for empty array brackets', () => {
    expect(() => ObjectPaths.fromString('users[]')).toThrow()
  })

  test('should throw for non-numeric array index', () => {
    expect(() => ObjectPaths.fromString('users[abc]')).toThrow()
  })

  test('should throw for invalid property name with spaces', () => {
    expect(() => ObjectPaths.fromString('user name')).toThrow()
  })

  test('should throw for invalid property name with special characters', () => {
    expect(() => ObjectPaths.fromString('user-name')).toThrow()
  })

  test('should throw for empty string', () => {
    expect(() => ObjectPaths.fromString('')).toThrow()
  })

  test('should throw for path with negative array index', () => {
    expect(() => ObjectPaths.fromString('users[-1]')).toThrow()
  })

  test('should throw for unclosed array bracket', () => {
    expect(() => ObjectPaths.fromString('users[0')).toThrow()
  })

  test('should throw for unmatched closing bracket', () => {
    expect(() => ObjectPaths.fromString('users0]')).toThrow()
  })
})

describe('ObjectPaths.getValue', () => {
  test('should get simple property value', () => {
    const obj = { name: 'John', age: 30 }
    const result = ObjectPaths.getValue(obj, ObjectPaths.of('name'))

    expect(result).toBe('John')
  })

  test('should get nested property value', () => {
    const obj = { user: { profile: { name: 'Alice' } } }
    const result = ObjectPaths.getValue(obj, ObjectPaths.of('user.profile.name'))

    expect(result).toBe('Alice')
  })

  test('should get array element by index', () => {
    const obj = { users: ['Alice', 'Bob', 'Charlie'] }
    const result = ObjectPaths.getValue(obj, ObjectPaths.of('users[1]'))

    expect(result).toBe('Bob')
  })

  test('should get nested array element', () => {
    const obj = {
      data: {
        items: [{ name: 'Item 1' }, { name: 'Item 2' }, { name: 'Item 3' }],
      },
    }
    const result = ObjectPaths.getValue(obj, ObjectPaths.of('data.items[2].name'))

    expect(result).toBe('Item 3')
  })

  test('should get value from multidimensional array', () => {
    const obj = {
      matrix: [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ],
    }
    const result = ObjectPaths.getValue(obj, ObjectPaths.of('matrix[1][2]'))

    expect(result).toBe(6)
  })

  test('should get complex nested path with mixed access', () => {
    const obj = {
      company: {
        departments: [
          {
            name: 'Engineering',
            employees: [
              { name: 'John', skills: ['JavaScript', 'TypeScript'] },
              { name: 'Jane', skills: ['Python', 'Go'] },
            ],
          },
          {
            name: 'Marketing',
            employees: [{ name: 'Mike', skills: ['SEO', 'Content'] }],
          },
        ],
      },
    }

    const result = ObjectPaths.getValue(obj, ObjectPaths.of('company.departments[0].employees[1].skills[0]'))

    expect(result).toBe('Python')
  })

  test('should get value with underscore and dollar sign properties', () => {
    const obj = { _private: { $special: { user_data: 'secret' } } }
    const result = ObjectPaths.getValue(obj, ObjectPaths.of('_private.$special.user_data'))

    expect(result).toBe('secret')
  })

  test('should get first array element', () => {
    const obj = { items: ['first', 'second', 'third'] }
    const result = ObjectPaths.getValue(obj, ObjectPaths.of('items[0]'))

    expect(result).toBe('first')
  })

  test('should get last array element by index', () => {
    const obj = { items: ['a', 'b', 'c'] }
    const result = ObjectPaths.getValue(obj, ObjectPaths.of('items[2]'))

    expect(result).toBe('c')
  })

  test('should throw error when accessing non-existent property', () => {
    const obj = { name: 'John' }

    expect(() => ObjectPaths.getValue(obj, ObjectPaths.of('age'))).toThrow()
  })

  test('should throw error when accessing array index on non-array', () => {
    const obj = { name: 'John' }

    expect(() => ObjectPaths.getValue(obj, ObjectPaths.of('name[0]'))).toThrow()
  })

  test('should throw error when accessing property on null', () => {
    const obj = { user: null }

    expect(() => ObjectPaths.getValue(obj, ObjectPaths.of('user.name'))).toThrow()
  })

  test('should throw error when accessing property on undefined', () => {
    const obj = { user: undefined }

    expect(() => ObjectPaths.getValue(obj, ObjectPaths.of('user.name'))).toThrow()
  })

  test('should throw error when accessing out of bounds array index', () => {
    const obj = { items: ['a', 'b'] }

    expect(() => ObjectPaths.getValue(obj, ObjectPaths.of('items[5]'))).toThrow()
  })

  test('should throw error when accessing negative array index', () => {
    const obj = { items: ['a', 'b', 'c'] }

    expect(() => ObjectPaths.getValue(obj, ObjectPaths.of('items[-1]'))).toThrow()
  })

  test('should throw error when accessing property on primitive value', () => {
    const obj = { count: 42 }

    expect(() => ObjectPaths.getValue(obj, ObjectPaths.of('count.value'))).toThrow()
  })

  test('should throw error when accessing array index on string', () => {
    const obj = { message: 'hello' }

    expect(() => ObjectPaths.getValue(obj, ObjectPaths.of('message[0]'))).toThrow()
  })

  test('should get deeply nested object value', () => {
    const obj = {
      level1: {
        level2: {
          level3: {
            level4: {
              level5: 'deep value',
            },
          },
        },
      },
    }
    const result = ObjectPaths.getValue(obj, ObjectPaths.of('level1.level2.level3.level4.level5'))
    expect(result).toBe('deep value')
  })

  test('should handle mixed types in path', () => {
    const obj = {
      users: [
        {
          profile: {
            preferences: {
              notifications: [true, false, true],
            },
          },
        },
      ],
    }
    const result = ObjectPaths.getValue(obj, ObjectPaths.of('users[0].profile.preferences.notifications[2]'))
    expect(result).toBe(true)
  })
})

describe('ObjectPaths.applyValue', () => {
  test('should set simple property value', () => {
    const obj = { name: 'John', age: 30 }

    const result = ObjectPaths.applyValue(obj, ObjectPaths.of('name'), 'Jane')

    expect(result).toEqual({ name: 'Jane', age: 30 })
    expect(obj.name).toBe('John') // original unchanged
  })

  test('should set nested property value', () => {
    const obj = { user: { profile: { name: 'Alice' } } }

    const result = ObjectPaths.applyValue(obj, ObjectPaths.of('user.profile.name'), 'Bob')

    expect(result).toEqual({ user: { profile: { name: 'Bob' } } })
    expect(obj.user.profile.name).toBe('Alice') // original unchanged
  })

  test('should set array element by index', () => {
    const obj = { users: ['Alice', 'Bob', 'Charlie'] }

    const result = ObjectPaths.applyValue(obj, ObjectPaths.of('users[1]'), 'Bobby')

    expect(result).toEqual({ users: ['Alice', 'Bobby', 'Charlie'] })
    expect(obj.users[1]).toBe('Bob') // original unchanged
  })

  test('should set nested array element', () => {
    const obj = {
      data: {
        items: [{ name: 'Item 1' }, { name: 'Item 2' }],
      },
    }

    const result = ObjectPaths.applyValue(obj, ObjectPaths.of('data.items[0].name'), 'Updated Item')

    expect(result).toEqual({
      data: {
        items: [{ name: 'Updated Item' }, { name: 'Item 2' }],
      },
    })
    expect(obj.data.items[0]?.name).toBe('Item 1') // original unchanged
  })

  test('should set value in multidimensional array', () => {
    const obj = {
      matrix: [
        [1, 2, 3],
        [4, 5, 6],
      ],
    } as const

    const result = ObjectPaths.applyValue(obj, ObjectPaths.of('matrix[1][2]'), 99)

    expect(result).toEqual({
      matrix: [
        [1, 2, 3],
        [4, 5, 99],
      ],
    })
    expect(obj.matrix[1][2]).toBe(6) // original unchanged
  })

  test('should create new property', () => {
    const obj = { name: 'John' }

    const result = ObjectPaths.applyValue(obj, ObjectPaths.of('age'), 30)

    expect(result).toEqual({ name: 'John', age: 30 })
    expect(obj).not.toHaveProperty('age') // original unchanged
  })

  test('should NOT handle complex nested path creation and throw instead', () => {
    const obj = { user: { profile: { name: 'Alice' } } }
    expect(() => ObjectPaths.applyValue(obj, ObjectPaths.of('user.settings.theme'), 'dark')).toThrow()
  })

  test('should set null value', () => {
    const obj = { name: 'John', age: 30 }

    const result = ObjectPaths.applyValue(obj, ObjectPaths.of('age'), null)

    expect(result).toEqual({ name: 'John', age: null })
  })

  test('should set undefined value', () => {
    const obj = { name: 'John', age: 30 }

    const result = ObjectPaths.applyValue(obj, ObjectPaths.of('age'), undefined)

    expect(result).toEqual({ name: 'John', age: undefined })
  })

  test('should handle object replacement', () => {
    const obj = { user: { name: 'John', age: 30 } }
    const newUser = { name: 'Jane', role: 'admin' }

    const result = ObjectPaths.applyValue(obj, ObjectPaths.of('user'), newUser)

    expect(result).toEqual({ user: { name: 'Jane', role: 'admin' } })
  })

  test('should handle array replacement', () => {
    const obj = { items: [1, 2, 3] }
    const newItems = ['a', 'b', 'c']

    const result = ObjectPaths.applyValue(obj, ObjectPaths.of('items'), newItems)

    expect(result).toEqual({ items: ['a', 'b', 'c'] })
  })

  test('should maintain immutability for nested objects', () => {
    const obj = {
      user: { profile: { name: 'Alice' } },
      settings: { theme: 'light' },
    }

    const result: any = ObjectPaths.applyValue(obj, ObjectPaths.of('user.profile.name'), 'Bob')

    expect(result).not.toBe(obj)
    expect(result.user).not.toBe(obj.user)
    expect(result.user.profile).not.toBe(obj.user.profile)
    expect(result.settings).toBe(obj.settings)
  })

  test('should handle setting values in sparse arrays', () => {
    const obj = { items: [1, undefined, 3] }

    const result = ObjectPaths.applyValue(obj, ObjectPaths.of('items[1]'), 2)

    expect(result).toEqual({ items: [1, 2, 3] })
  })
})
