import { expectTypeOf } from 'expect-type'
import { FilterArrayByKey, FilterArrayByValue } from '@bessemer/cornerstone/types'

describe('FilterArrayByValue', () => {
  test('should support empty array', () => {
    type Input = []
    expectTypeOf<FilterArrayByValue<Input, { a: number }>>().toEqualTypeOf<[]>()
  })

  test('should filter typed Array by value in declared order', () => {
    type Input = [{ a: number; b: string }, { a: number; c: boolean }, { c: boolean }, { d: string }, { e: number }]
    expectTypeOf<FilterArrayByValue<Input, { a: number }>>().toEqualTypeOf<[{ a: number; b: string }, { a: number; c: boolean }]>()
    expectTypeOf<FilterArrayByValue<Input, { c: boolean }>>().toEqualTypeOf<[{ a: number; c: boolean }, { c: boolean }]>()
    expectTypeOf<FilterArrayByValue<Input, { d: string }>>().toEqualTypeOf<[{ d: string }]>()
    expectTypeOf<FilterArrayByValue<Input, { e: number }>>().toEqualTypeOf<[{ e: number }]>()
  })
})

describe('FilterArrayByKey', () => {
  test('should support empty array', () => {
    type Input = []
    expectTypeOf<FilterArrayByKey<Input, 'a'>>().toEqualTypeOf<[]>()
  })

  test('should filter typed Array by key in declared order', () => {
    type Input = [{ a: number; b: string }, { a: number; c: boolean }, { c: boolean }, { d: string }, { e: number }]
    expectTypeOf<FilterArrayByKey<Input, 'a'>>().toEqualTypeOf<[{ a: number; b: string }, { a: number; c: boolean }]>()
    expectTypeOf<FilterArrayByKey<Input, 'c'>>().toEqualTypeOf<[{ a: number; c: boolean }, { c: boolean }]>()
    expectTypeOf<FilterArrayByKey<Input, 'd'>>().toEqualTypeOf<[{ d: string }]>()
    expectTypeOf<FilterArrayByKey<Input, 'e'>>().toEqualTypeOf<[{ e: number }]>()
  })
})
