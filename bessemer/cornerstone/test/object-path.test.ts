import { ObjectPaths } from '@bessemer/cornerstone'
import { GetWithPath } from 'type-fest/source/get'
import { ToString } from 'type-fest/source/internal'

describe('ObjectPaths.of', () => {
  test('should create ObjectPath from single string element', () => {
    const result = ObjectPaths.of(['name'])
    expect(result).toEqual(['name'])
  })

  test('should create ObjectPath from multiple string elements', () => {
    const result = ObjectPaths.of(['user', 'profile', 'name'])
    expect(result).toEqual(['user', 'profile', 'name'])
  })

  test('should create ObjectPath from single number element', () => {
    const result = ObjectPaths.of([0])
    expect(result).toEqual(['0'])
  })

  test('should create ObjectPath from mixed string and number elements', () => {
    const result = ObjectPaths.of(['users', 0, 'name'])
    expect(result).toEqual(['users', '0', 'name'])
  })

  test('should create ObjectPath from multiple number elements', () => {
    const result = ObjectPaths.of([0, 1, 2])
    expect(result).toEqual(['0', '1', '2'])
  })

  test('should create ObjectPath with special characters in property names', () => {
    const result = ObjectPaths.of(['_private', '$special', 'user_data'])
    expect(result).toEqual(['_private', '$special', 'user_data'])
  })

  test('should work for empty array', () => {
    const result = ObjectPaths.of([])
    expect(result).toEqual([])
  })

  test('should handle complex mixed path', () => {
    const result = ObjectPaths.of(['company', 'departments', 0, 'employees', 1, 'skills', 2])
    expect(result).toEqual(['company', 'departments', '0', 'employees', '1', 'skills', '2'])
  })
})

describe('ObjectPaths.fromString', () => {
  test('should parse single property name', () => {
    const result = ObjectPaths.fromString('name')
    expect(result).toEqual(['name'])
  })

  test('should parse nested property path', () => {
    const result = ObjectPaths.fromString('user.profile.name')
    expect(result).toEqual(['user', 'profile', 'name'])
  })

  test('should parse single array index', () => {
    const result = ObjectPaths.fromString('items.0')
    expect(result).toEqual(['items', '0'])
  })

  test('should parse multiple array indices', () => {
    const result = ObjectPaths.fromString('matrix.0.1.2')
    expect(result).toEqual(['matrix', '0', '1', '2'])
  })

  test('should parse mixed property and array access', () => {
    const result = ObjectPaths.fromString('users.0.profile.tags.2')
    expect(result).toEqual(['users', '0', 'profile', 'tags', '2'])
  })

  test('should parse complex nested path', () => {
    const result = ObjectPaths.fromString('company.departments.0.employees.1.skills.2')
    expect(result).toEqual(['company', 'departments', '0', 'employees', '1', 'skills', '2'])
  })

  test('should parse property names with underscores', () => {
    const result = ObjectPaths.fromString('user_data.profile_info.full_name')
    expect(result).toEqual(['user_data', 'profile_info', 'full_name'])
  })

  test('should parse property names with dollar signs', () => {
    const result = ObjectPaths.fromString('$root.$config.$settings')
    expect(result).toEqual(['$root', '$config', '$settings'])
  })

  test('should parse property names starting with underscore', () => {
    const result = ObjectPaths.fromString('_private._internal._data')
    expect(result).toEqual(['_private', '_internal', '_data'])
  })

  test('should parse mixed special characters', () => {
    const result = ObjectPaths.fromString('_private.$special.user_data')
    expect(result).toEqual(['_private', '$special', 'user_data'])
  })

  test('should parse large array indices', () => {
    const result = ObjectPaths.fromString('items.999.data.1234')
    expect(result).toEqual(['items', '999', 'data', '1234'])
  })

  test('should parse zero array index', () => {
    const result = ObjectPaths.fromString('items.0')
    expect(result).toEqual(['items', '0'])
  })

  test('should throw for empty string', () => {
    expect(() => ObjectPaths.fromString('')).toThrow()
  })

  test('should throw for path starting with dot', () => {
    expect(() => ObjectPaths.fromString('.user.name')).toThrow()
  })

  test('should throw for path ending with dot', () => {
    expect(() => ObjectPaths.fromString('user.name.')).toThrow()
  })

  test('should throw for consecutive dots', () => {
    expect(() => ObjectPaths.fromString('user..name')).toThrow()
  })

  test('should throw for path starting with number', () => {
    expect(() => ObjectPaths.fromString('123invalid')).toThrow()
  })

  test('should parse property names with numbers (but not starting with)', () => {
    const result = ObjectPaths.fromString('user1.data2.field3')
    expect(result).toEqual(['user1', 'data2', 'field3'])
  })

  test('should handle very long property names', () => {
    const longName = 'a'.repeat(100)
    const result = ObjectPaths.fromString(`${longName}.${longName}`)
    expect(result).toEqual([longName, longName])
  })

  test('should parse array index with dot notation', () => {
    const result = ObjectPaths.fromString('items.0')
    expect(result).toEqual(['items', '0'])
  })

  test('should parse multiple array indices with dot notation', () => {
    const result = ObjectPaths.fromString('matrix.0.1.2')
    expect(result).toEqual(['matrix', '0', '1', '2'])
  })

  test('should parse mixed property and array access with dot notation', () => {
    const result = ObjectPaths.fromString('users.0.profile.tags.2')
    expect(result).toEqual(['users', '0', 'profile', 'tags', '2'])
  })

  test('should parse complex nested path with dot notation array indices', () => {
    const result = ObjectPaths.fromString('company.departments.0.employees.1.skills.2')
    expect(result).toEqual(['company', 'departments', '0', 'employees', '1', 'skills', '2'])
  })

  test('should parse large array indices with dot notation', () => {
    const result = ObjectPaths.fromString('items.999.data.1234')
    expect(result).toEqual(['items', '999', 'data', '1234'])
  })

  test('should parse zero array index with dot notation', () => {
    const result = ObjectPaths.fromString('items.0')
    expect(result).toEqual(['items', '0'])
  })

  test('should parse single digit array indices with dot notation', () => {
    const result = ObjectPaths.fromString('data.0.info.5.value.9')
    expect(result).toEqual(['data', '0', 'info', '5', 'value', '9'])
  })

  test('should parse alternating property names and dot notation indices', () => {
    const result = ObjectPaths.fromString('level1.0.level2.1.level3.2')
    expect(result).toEqual(['level1', '0', 'level2', '1', 'level3', '2'])
  })
})

describe('ObjectPaths.getValue', () => {
  test('should get simple property value', () => {
    const obj = { name: 'John', age: 30 }
    const result = ObjectPaths.getValue(obj, ObjectPaths.fromString('name'))

    expect(result).toBe('John')
  })

  test('should get nested property value', () => {
    const obj = { user: { profile: { name: 'Alice' } } }
    const result = ObjectPaths.getValue(obj, ObjectPaths.fromString('user.profile.name'))

    expect(result).toBe('Alice')
  })

  test('should get array element by index', () => {
    const obj = { users: ['Alice', 'Bob', 'Charlie'] } as const

    type Blah = GetWithPath<typeof obj, ['users', ToString<1>]>
    const result = ObjectPaths.getValue(obj, ObjectPaths.fromString('users.1'))
    expect(result).toBe('Bob')
  })

  test('should get nested array element', () => {
    const obj = {
      data: {
        items: [{ name: 'Item 1' }, { name: 'Item 2' }, { name: 'Item 3' }],
      },
    }
    const result = ObjectPaths.getValue(obj, ObjectPaths.fromString('data.items.2.name'))

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
    const result = ObjectPaths.getValue(obj, ObjectPaths.fromString('matrix.1.2'))

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

    const result = ObjectPaths.getValue(obj, ObjectPaths.fromString('company.departments.0.employees.1.skills.0'))

    expect(result).toBe('Python')
  })

  test('should get value with underscore and dollar sign properties', () => {
    const obj = { _private: { $special: { user_data: 'secret' } } }
    const result = ObjectPaths.getValue(obj, ObjectPaths.fromString('_private.$special.user_data'))

    expect(result).toBe('secret')
  })

  test('should get first array element', () => {
    const obj = { items: ['first', 'second', 'third'] }
    const result = ObjectPaths.getValue(obj, ObjectPaths.fromString('items.0'))

    expect(result).toBe('first')
  })

  test('should get last array element by index', () => {
    const obj = { items: ['a', 'b', 'c'] }
    const result = ObjectPaths.getValue(obj, ObjectPaths.fromString('items.2'))

    expect(result).toBe('c')
  })

  test('should throw error when accessing non-existent property', () => {
    const obj = { name: 'John' }

    expect(() => ObjectPaths.getValue(obj, ObjectPaths.fromString('age'))).toThrow()
  })

  test('should throw error when accessing array index on non-array', () => {
    const obj = { name: 'John' }

    expect(() => ObjectPaths.getValue(obj, ObjectPaths.fromString('name.0'))).toThrow()
  })

  test('should throw error when accessing property on null', () => {
    const obj = { user: null }

    expect(() => ObjectPaths.getValue(obj, ObjectPaths.fromString('user.name'))).toThrow()
  })

  test('should throw error when accessing property on undefined', () => {
    const obj = { user: undefined }

    expect(() => ObjectPaths.getValue(obj, ObjectPaths.fromString('user.name'))).toThrow()
  })

  test('should throw error when accessing out of bounds array index', () => {
    const obj = { items: ['a', 'b'] }

    expect(() => ObjectPaths.getValue(obj, ObjectPaths.fromString('items.5'))).toThrow()
  })

  test('should throw error when accessing negative array index', () => {
    const obj = { items: ['a', 'b', 'c'] }

    expect(() => ObjectPaths.getValue(obj, ObjectPaths.fromString('items.-1'))).toThrow()
  })

  test('should throw error when accessing property on primitive value', () => {
    const obj = { count: 42 }

    expect(() => ObjectPaths.getValue(obj, ObjectPaths.fromString('count.value'))).toThrow()
  })

  test('should throw error when accessing array index on string', () => {
    const obj = { message: 'hello' }

    expect(() => ObjectPaths.getValue(obj, ObjectPaths.fromString('message.0'))).toThrow()
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
    const result = ObjectPaths.getValue(obj, ObjectPaths.fromString('level1.level2.level3.level4.level5'))
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
    const result = ObjectPaths.getValue(obj, ObjectPaths.fromString('users.0.profile.preferences.notifications.2'))
    expect(result).toBe(true)
  })
})

describe('ObjectPaths.applyValue', () => {
  test('should set simple property value', () => {
    const obj = { name: 'John', age: 30 }

    const result = ObjectPaths.applyValue(obj, ObjectPaths.fromString('name'), 'Jane')

    expect(result).toEqual({ name: 'Jane', age: 30 })
    expect(obj.name).toBe('John') // original unchanged
  })

  test('should set nested property value', () => {
    const obj = { user: { profile: { name: 'Alice' } } }

    const result = ObjectPaths.applyValue(obj, ObjectPaths.fromString('user.profile.name'), 'Bob')

    expect(result).toEqual({ user: { profile: { name: 'Bob' } } })
    expect(obj.user.profile.name).toBe('Alice') // original unchanged
  })

  test('should set array element by index', () => {
    const obj = { users: ['Alice', 'Bob', 'Charlie'] }

    const result = ObjectPaths.applyValue(obj, ObjectPaths.fromString('users.1'), 'Bobby')

    expect(result).toEqual({ users: ['Alice', 'Bobby', 'Charlie'] })
    expect(obj.users[1]).toBe('Bob') // original unchanged
  })

  test('should set nested array element', () => {
    const obj = {
      data: {
        items: [{ name: 'Item 1' }, { name: 'Item 2' }],
      },
    }

    const result = ObjectPaths.applyValue(obj, ObjectPaths.fromString('data.items.0.name'), 'Updated Item')

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

    const result = ObjectPaths.applyValue(obj, ObjectPaths.fromString('matrix.1.2'), 99)

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

    const result = ObjectPaths.applyValue(obj, ObjectPaths.fromString('age'), 30)

    expect(result).toEqual({ name: 'John', age: 30 })
    expect(obj).not.toHaveProperty('age') // original unchanged
  })

  test('should NOT handle complex nested path creation and throw instead', () => {
    const obj = { user: { profile: { name: 'Alice' } } }
    expect(() => ObjectPaths.applyValue(obj, ObjectPaths.fromString('user.settings.theme'), 'dark')).toThrow()
  })

  test('should set null value', () => {
    const obj = { name: 'John', age: 30 }

    const result = ObjectPaths.applyValue(obj, ObjectPaths.fromString('age'), null)

    expect(result).toEqual({ name: 'John', age: null })
  })

  test('should set undefined value', () => {
    const obj = { name: 'John', age: 30 }

    const result = ObjectPaths.applyValue(obj, ObjectPaths.fromString('age'), undefined)

    expect(result).toEqual({ name: 'John', age: undefined })
  })

  test('should handle object replacement', () => {
    const obj = { user: { name: 'John', age: 30 } }
    const newUser = { name: 'Jane', role: 'admin' }

    const result = ObjectPaths.applyValue(obj, ObjectPaths.fromString('user'), newUser)

    expect(result).toEqual({ user: { name: 'Jane', role: 'admin' } })
  })

  test('should handle array replacement', () => {
    const obj = { items: [1, 2, 3] }
    const newItems = ['a', 'b', 'c']

    const result = ObjectPaths.applyValue(obj, ObjectPaths.fromString('items'), newItems)

    expect(result).toEqual({ items: ['a', 'b', 'c'] })
  })

  test('should maintain immutability for nested objects', () => {
    const obj = {
      user: { profile: { name: 'Alice' } },
      settings: { theme: 'light' },
    }

    const result: any = ObjectPaths.applyValue(obj, ObjectPaths.fromString('user.profile.name'), 'Bob')

    expect(result).not.toBe(obj)
    expect(result.user).not.toBe(obj.user)
    expect(result.user.profile).not.toBe(obj.user.profile)
    expect(result.settings).toBe(obj.settings)
  })

  test('should handle setting values in sparse arrays', () => {
    const obj = { items: [1, undefined, 3] }

    const result = ObjectPaths.applyValue(obj, ObjectPaths.fromString('items.1'), 2)

    expect(result).toEqual({ items: [1, 2, 3] })
  })
})
