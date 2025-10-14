import { ResourceKeys } from '@bessemer/cornerstone'
import { expectTypeOf } from 'expect-type'
import { NamespacedKey, ResourceNamespace } from '@bessemer/cornerstone/resource-key'
import { NominalType } from '@bessemer/cornerstone/types'

describe('ResourceKeys.emptyNamespace', () => {
  expect(ResourceKeys.emptyNamespace()).toEqual(undefined)
  expectTypeOf(ResourceKeys.emptyNamespace()).not.toEqualTypeOf<never>()
  expectTypeOf(ResourceKeys.emptyNamespace()).toEqualTypeOf<ResourceNamespace<undefined>>()
})

describe('ResourceKeys.createNamespace', () => {
  test('should support constant namespaces', () => {
    expect(ResourceKeys.createNamespace('1234')).toEqual('1234')
    expectTypeOf(ResourceKeys.createNamespace('1234')).toEqualTypeOf<ResourceNamespace<'1234'>>()

    expect(ResourceKeys.createNamespace('test-namespace')).toEqual('test-namespace')
    expectTypeOf(ResourceKeys.createNamespace('test-namespace')).toEqualTypeOf<ResourceNamespace<'test-namespace'>>()

    expect(ResourceKeys.createNamespace('test-namespace/with-sub-namespace')).toEqual('test-namespace/with-sub-namespace')
    expectTypeOf(ResourceKeys.createNamespace('test-namespace/with-sub-namespace')).toEqualTypeOf<
      ResourceNamespace<'test-namespace/with-sub-namespace'>
    >()

    expect(ResourceKeys.createNamespace('1234/buckle-my-shoe/5678')).toEqual('1234/buckle-my-shoe/5678')
    expectTypeOf(ResourceKeys.createNamespace('1234/buckle-my-shoe/5678')).toEqualTypeOf<ResourceNamespace<'1234/buckle-my-shoe/5678'>>()
  })

  test('should throw on invalid namespaces', () => {
    expect(() => ResourceKeys.createNamespace('/1234')).toThrow()
    expect(() => ResourceKeys.createNamespace('1234/')).toThrow()
    expect(() => ResourceKeys.createNamespace('  test-namespace')).toThrow()
    expect(() => ResourceKeys.createNamespace('test-name   space  ')).toThrow()
    expect(() => ResourceKeys.createNamespace('test-namespace/with-sub-namespace/')).toThrow()
    expect(() => ResourceKeys.createNamespace('test-namespace//with-sub-namespace')).toThrow()
    expect(() => ResourceKeys.createNamespace('')).toThrow()
    expect(() => ResourceKeys.createNamespace('   ')).toThrow()
  })

  test('should support string namespaces', () => {
    {
      const namespace: string = 'test-namespace'
      expect(ResourceKeys.createNamespace(namespace)).toEqual(namespace)
      expectTypeOf(ResourceKeys.createNamespace(namespace)).toEqualTypeOf<ResourceNamespace<string>>()
    }

    {
      const namespace: string = 'test-namespace/with-sub-namespace'
      expect(ResourceKeys.createNamespace(namespace)).toEqual(namespace)
      expectTypeOf(ResourceKeys.createNamespace(namespace)).toEqualTypeOf<ResourceNamespace<string>>()
    }
  })

  test('should work with undefined', () => {
    expect(ResourceKeys.createNamespace(undefined)).toEqual(undefined)
    expectTypeOf(ResourceKeys.createNamespace(undefined)).toEqualTypeOf<ResourceNamespace<undefined>>()

    const test = (): string | undefined => {
      return undefined
    }

    expect(ResourceKeys.createNamespace(test())).toEqual(test())
    expectTypeOf(ResourceKeys.createNamespace(test())).toEqualTypeOf<ResourceNamespace<undefined | string>>()
  })
})

describe('ResourceKeys.namespaceKey', () => {
  test('should support applying empty namespaces', () => {
    {
      const key = '1234'
      expect(ResourceKeys.namespaceKey(key, ResourceKeys.emptyNamespace())).toEqual(key)
      expectTypeOf(ResourceKeys.namespaceKey(key, ResourceKeys.emptyNamespace())).toEqualTypeOf<NamespacedKey<typeof key, undefined>>()
    }

    {
      const key: string = '1234'
      expect(ResourceKeys.namespaceKey(key, ResourceKeys.emptyNamespace())).toEqual(key)
      expectTypeOf(ResourceKeys.namespaceKey(key, ResourceKeys.emptyNamespace())).toEqualTypeOf<NamespacedKey<string, undefined>>()
    }

    {
      type TestType = NominalType<string, 'test-type'>
      const key: TestType = '1234' as TestType
      expect(ResourceKeys.namespaceKey(key, ResourceKeys.emptyNamespace())).toEqual(key)
      expectTypeOf(ResourceKeys.namespaceKey(key, ResourceKeys.emptyNamespace())).toEqualTypeOf<NamespacedKey<TestType, undefined>>()
    }

    {
      const key = '12/34'
      expect(ResourceKeys.namespaceKey(key, ResourceKeys.emptyNamespace())).toEqual('12%2F34')
      expectTypeOf(ResourceKeys.namespaceKey(key, ResourceKeys.emptyNamespace())).toEqualTypeOf<NamespacedKey<typeof key, undefined>>()
    }
  })

  test('should support applying regular namespaces', () => {
    {
      const key = '1234'
      const namespace = 'foo/bar'
      expect(ResourceKeys.namespaceKey(key, ResourceKeys.createNamespace(namespace))).toEqual(`${namespace}/${key}`)
      expectTypeOf(ResourceKeys.namespaceKey(key, ResourceKeys.createNamespace(namespace))).toEqualTypeOf<
        NamespacedKey<typeof key, typeof namespace>
      >()
    }

    {
      const key: string = '1234'
      const namespace = 'foo/bar'
      expect(ResourceKeys.namespaceKey(key, ResourceKeys.createNamespace(namespace))).toEqual(`${namespace}/${key}`)
      expectTypeOf(ResourceKeys.namespaceKey(key, ResourceKeys.createNamespace(namespace))).toEqualTypeOf<NamespacedKey<string, typeof namespace>>()
    }

    {
      type TestType = NominalType<string, 'test-type'>
      const key: TestType = '1234' as TestType
      const namespace = 'foo'
      expect(ResourceKeys.namespaceKey(key, ResourceKeys.createNamespace(namespace))).toEqual(`${namespace}/${key}`)
      expectTypeOf(ResourceKeys.namespaceKey(key, ResourceKeys.createNamespace(namespace))).toEqualTypeOf<NamespacedKey<TestType, typeof namespace>>()
    }

    {
      const key = '12/34'
      const namespace = 'foo/bar/baz'
      expect(ResourceKeys.namespaceKey(key, ResourceKeys.createNamespace(namespace))).toEqual(`${namespace}/12%2F34`)
      expectTypeOf(ResourceKeys.namespaceKey(key, ResourceKeys.createNamespace(namespace))).toEqualTypeOf<
        NamespacedKey<typeof key, typeof namespace>
      >()
    }
  })

  test('should support namespacing a namespace', () => {
    const key = '12/34'
    const namespace = 'foo/bar/baz'
    const namespacedKey = ResourceKeys.namespaceKey(key, ResourceKeys.createNamespace(namespace))
    expect(namespacedKey).toEqual(`${namespace}/${ResourceKeys.encodeKey(key)}`)

    const secondNamespace = 'another-one'
    const doublyNamespacedKey = ResourceKeys.namespaceKey(namespacedKey, ResourceKeys.createNamespace(secondNamespace))
    expect(doublyNamespacedKey).toEqual(`${secondNamespace}/${ResourceKeys.encodeKey(`${namespace}/${ResourceKeys.encodeKey(key)}`)}`)
  })
})

describe('ResourceKeys.destructureKey', () => {
  test('should support splitting empty namespaces', () => {
    {
      const key = '1234'
      const namespacedKey = ResourceKeys.namespaceKey(key, ResourceKeys.emptyNamespace())
      const [keyValue, namespaceValue] = ResourceKeys.destructureKey(namespacedKey)

      expect(keyValue).toEqual(key)
      expect(namespaceValue).toEqual(undefined)
      expectTypeOf(keyValue).toEqualTypeOf<typeof key>()
      expectTypeOf(namespaceValue).toEqualTypeOf<undefined>()
    }

    {
      const key: string = '1234'
      const namespacedKey = ResourceKeys.namespaceKey(key, ResourceKeys.emptyNamespace())
      const [keyValue, namespaceValue] = ResourceKeys.destructureKey(namespacedKey)

      expect(keyValue).toEqual(key)
      expect(namespaceValue).toEqual(undefined)
      expectTypeOf(keyValue).toEqualTypeOf<typeof key>()
      expectTypeOf(namespaceValue).toEqualTypeOf<undefined>()
    }

    {
      type TestType = NominalType<string, 'test-type'>

      const key: TestType = '1234' as TestType
      const namespacedKey = ResourceKeys.namespaceKey(key, ResourceKeys.emptyNamespace())
      const [keyValue, namespaceValue] = ResourceKeys.destructureKey(namespacedKey)

      expect(keyValue).toEqual(key)
      expect(namespaceValue).toEqual(undefined)
      expectTypeOf(keyValue).toEqualTypeOf<typeof key>()
      expectTypeOf(namespaceValue).toEqualTypeOf<undefined>()
    }

    {
      const key = '12/34'
      const namespacedKey = ResourceKeys.namespaceKey(key, ResourceKeys.emptyNamespace())
      const [keyValue, namespaceValue] = ResourceKeys.destructureKey(namespacedKey)

      expect(keyValue).toEqual(key)
      expect(namespaceValue).toEqual(undefined)
      expectTypeOf(keyValue).toEqualTypeOf<typeof key>()
      expectTypeOf(namespaceValue).toEqualTypeOf<undefined>()
    }
  })

  test('should support splitting regular namespaces', () => {
    // JOHN!!
  })

  test('should support splitting nested namespaces', () => {
    // JOHN!!
  })
})
