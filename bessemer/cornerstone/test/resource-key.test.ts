import { ResourceKeys } from '@bessemer/cornerstone'
import { expectTypeOf } from 'expect-type'
import { NamespacedKey, ResourceNamespace } from '@bessemer/cornerstone/resource-key'
import { NominalType } from '@bessemer/cornerstone/types'

describe('ResourceKeys.emptyNamespace', () => {
  expect(ResourceKeys.emptyNamespace()).toEqual(undefined)
  expectTypeOf(ResourceKeys.emptyNamespace()).not.toEqualTypeOf<never>()
  expectTypeOf(ResourceKeys.emptyNamespace()).toEqualTypeOf<ResourceNamespace<undefined>>()
})

describe('ResourceKeys.namespace', () => {
  test('should support constant namespaces', () => {
    expect(ResourceKeys.namespace('1234')).toEqual('1234')
    expectTypeOf(ResourceKeys.namespace('1234')).toEqualTypeOf<ResourceNamespace<'1234'>>()

    expect(ResourceKeys.namespace('test-namespace')).toEqual('test-namespace')
    expectTypeOf(ResourceKeys.namespace('test-namespace')).toEqualTypeOf<ResourceNamespace<'test-namespace'>>()

    expect(ResourceKeys.namespace('test-namespace/with-sub-namespace')).toEqual('test-namespace/with-sub-namespace')
    expectTypeOf(ResourceKeys.namespace('test-namespace/with-sub-namespace')).toEqualTypeOf<ResourceNamespace<'test-namespace/with-sub-namespace'>>()

    expect(ResourceKeys.namespace('1234/buckle-my-shoe/5678')).toEqual('1234/buckle-my-shoe/5678')
    expectTypeOf(ResourceKeys.namespace('1234/buckle-my-shoe/5678')).toEqualTypeOf<ResourceNamespace<'1234/buckle-my-shoe/5678'>>()
  })

  test('should throw on invalid namespaces', () => {
    expect(() => ResourceKeys.namespace('/1234')).toThrow()
    expect(() => ResourceKeys.namespace('1234/')).toThrow()
    expect(() => ResourceKeys.namespace('  test-namespace')).toThrow()
    expect(() => ResourceKeys.namespace('test-name   space  ')).toThrow()
    expect(() => ResourceKeys.namespace('test-namespace/with-sub-namespace/')).toThrow()
    expect(() => ResourceKeys.namespace('test-namespace//with-sub-namespace')).toThrow()
    expect(() => ResourceKeys.namespace('')).toThrow()
    expect(() => ResourceKeys.namespace('   ')).toThrow()
  })

  test('should support string namespaces', () => {
    {
      const namespace: string = 'test-namespace'
      expect(ResourceKeys.namespace(namespace)).toEqual(namespace)
      expectTypeOf(ResourceKeys.namespace(namespace)).toEqualTypeOf<ResourceNamespace<string>>()
    }

    {
      const namespace: string = 'test-namespace/with-sub-namespace'
      expect(ResourceKeys.namespace(namespace)).toEqual(namespace)
      expectTypeOf(ResourceKeys.namespace(namespace)).toEqualTypeOf<ResourceNamespace<string>>()
    }
  })

  test('should work with undefined', () => {
    expect(ResourceKeys.namespace(undefined)).toEqual(undefined)
    expectTypeOf(ResourceKeys.namespace(undefined)).toEqualTypeOf<ResourceNamespace<undefined>>()

    const test = (): string | undefined => {
      return undefined
    }

    expect(ResourceKeys.namespace(test())).toEqual(test())
    expectTypeOf(ResourceKeys.namespace(test())).toEqualTypeOf<ResourceNamespace<undefined | string>>()
  })
})

describe('ResourceKeys.applyNamespace', () => {
  test('should support applying empty namespaces', () => {
    {
      const key = '1234'
      expect(ResourceKeys.applyNamespace(key, ResourceKeys.emptyNamespace())).toEqual(key)
      expectTypeOf(ResourceKeys.applyNamespace(key, ResourceKeys.emptyNamespace())).toEqualTypeOf<NamespacedKey<typeof key, undefined>>()
    }

    {
      const key: string = '1234'
      expect(ResourceKeys.applyNamespace(key, ResourceKeys.emptyNamespace())).toEqual(key)
      expectTypeOf(ResourceKeys.applyNamespace(key, ResourceKeys.emptyNamespace())).toEqualTypeOf<NamespacedKey<string, undefined>>()
    }

    {
      type TestType = NominalType<string, 'test-type'>
      const key: TestType = '1234' as TestType
      expect(ResourceKeys.applyNamespace(key, ResourceKeys.emptyNamespace())).toEqual(key)
      expectTypeOf(ResourceKeys.applyNamespace(key, ResourceKeys.emptyNamespace())).toEqualTypeOf<NamespacedKey<TestType, undefined>>()
    }

    {
      const key = '12/34'
      expect(ResourceKeys.applyNamespace(key, ResourceKeys.emptyNamespace())).toEqual('12%2F34')
      expectTypeOf(ResourceKeys.applyNamespace(key, ResourceKeys.emptyNamespace())).toEqualTypeOf<NamespacedKey<typeof key, undefined>>()
    }
  })

  test('should support applying regular namespaces', () => {
    {
      const key = '1234'
      const namespace = 'foo/bar'
      expect(ResourceKeys.applyNamespace(key, ResourceKeys.namespace(namespace))).toEqual(`${namespace}/${key}`)
      expectTypeOf(ResourceKeys.applyNamespace(key, ResourceKeys.namespace(namespace))).toEqualTypeOf<NamespacedKey<typeof key, typeof namespace>>()
    }

    {
      const key: string = '1234'
      const namespace = 'foo/bar'
      expect(ResourceKeys.applyNamespace(key, ResourceKeys.namespace(namespace))).toEqual(`${namespace}/${key}`)
      expectTypeOf(ResourceKeys.applyNamespace(key, ResourceKeys.namespace(namespace))).toEqualTypeOf<NamespacedKey<string, typeof namespace>>()
    }

    {
      type TestType = NominalType<string, 'test-type'>
      const key: TestType = '1234' as TestType
      const namespace = 'foo'
      expect(ResourceKeys.applyNamespace(key, ResourceKeys.namespace(namespace))).toEqual(`${namespace}/${key}`)
      expectTypeOf(ResourceKeys.applyNamespace(key, ResourceKeys.namespace(namespace))).toEqualTypeOf<NamespacedKey<TestType, typeof namespace>>()
    }

    {
      const key = '12/34'
      const namespace = 'foo/bar/baz'
      expect(ResourceKeys.applyNamespace(key, ResourceKeys.namespace(namespace))).toEqual(`${namespace}/12%2F34`)
      expectTypeOf(ResourceKeys.applyNamespace(key, ResourceKeys.namespace(namespace))).toEqualTypeOf<NamespacedKey<typeof key, typeof namespace>>()
    }
  })

  test('should support namespacing a namespace', () => {
    const key = '12/34'
    const namespace = 'foo/bar/baz'
    const namespacedKey = ResourceKeys.applyNamespace(key, ResourceKeys.namespace(namespace))
    expect(namespacedKey).toEqual(`${namespace}/${ResourceKeys.encodeKey(key)}`)

    const secondNamespace = 'another-one'
    const doublyNamespacedKey = ResourceKeys.applyNamespace(namespacedKey, ResourceKeys.namespace(secondNamespace))
    expect(doublyNamespacedKey).toEqual(`${secondNamespace}/${ResourceKeys.encodeKey(`${namespace}/${ResourceKeys.encodeKey(key)}`)}`)
  })
})

describe('ResourceKeys.splitNamespace', () => {
  test('should support splitting empty namespaces', () => {
    {
      const key = '1234'
      const namespacedKey = ResourceKeys.applyNamespace(key, ResourceKeys.emptyNamespace())
      const [keyValue, namespaceValue] = ResourceKeys.splitNamespace(namespacedKey)

      expect(keyValue).toEqual(key)
      expect(namespaceValue).toEqual(undefined)
      expectTypeOf(keyValue).toEqualTypeOf<typeof key>()
      expectTypeOf(namespaceValue).toEqualTypeOf<undefined>()
    }

    {
      const key: string = '1234'
      const namespacedKey = ResourceKeys.applyNamespace(key, ResourceKeys.emptyNamespace())
      const [keyValue, namespaceValue] = ResourceKeys.splitNamespace(namespacedKey)

      expect(keyValue).toEqual(key)
      expect(namespaceValue).toEqual(undefined)
      expectTypeOf(keyValue).toEqualTypeOf<typeof key>()
      expectTypeOf(namespaceValue).toEqualTypeOf<undefined>()
    }

    {
      type TestType = NominalType<string, 'test-type'>

      const key: TestType = '1234' as TestType
      const namespacedKey = ResourceKeys.applyNamespace(key, ResourceKeys.emptyNamespace())
      const [keyValue, namespaceValue] = ResourceKeys.splitNamespace(namespacedKey)

      expect(keyValue).toEqual(key)
      expect(namespaceValue).toEqual(undefined)
      expectTypeOf(keyValue).toEqualTypeOf<typeof key>()
      expectTypeOf(namespaceValue).toEqualTypeOf<undefined>()
    }

    {
      const key = '12/34'
      const namespacedKey = ResourceKeys.applyNamespace(key, ResourceKeys.emptyNamespace())
      const [keyValue, namespaceValue] = ResourceKeys.splitNamespace(namespacedKey)

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
