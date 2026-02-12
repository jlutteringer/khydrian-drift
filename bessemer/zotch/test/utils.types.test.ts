import { PathParamNames } from '@bessemer/zotch/zotch-type-utils'
import { expectTypeOf } from 'expect-type'

describe('utils.types', () => {
  describe('PathParamNames', () => {
    it('should support empty string', () => {
      type Input = PathParamNames<''>
      //    ^?
      expectTypeOf<PathParamNames<''>>().toEqualTypeOf<never>()
    })
    it('should extract params from path', () => {
      type Input = PathParamNames<'/endpoint/:param1/:param2/rest'>
      //    ^?
      expectTypeOf<Input>().toEqualTypeOf<'param1' | 'param2'>()
    })
    it('should extract multiple params one after another from path', () => {
      type Input = PathParamNames<'/endpoint/:param1:param2/rest'>
      //    ^?
      expectTypeOf<Input>().toEqualTypeOf<'param1' | 'param2'>()
    })
    it('should extract param when encoded colon is in path', () => {
      type Input1 = PathParamNames<'/endpoint/:param1%3Aaction'>
      //    ^?
      expectTypeOf<Input1>().toEqualTypeOf<'param1'>()
      type Input2 = PathParamNames<'/endpoint/:param1%action:param2'>
      //    ^?
      expectTypeOf<Input2>().toEqualTypeOf<'param1' | 'param2'>()
    })

    it('should allow path params in query string', () => {
      type Input = PathParamNames<'/endpoint/:param1?param=:param2'>
      //    ^?
      expectTypeOf<Input>().toEqualTypeOf<'param1' | 'param2'>()
    })

    it('should allow path params in fragment string', () => {
      type Input = PathParamNames<'/endpoint/:param1#:param2'>
      //    ^?
      expectTypeOf<Input>().toEqualTypeOf<'param1' | 'param2'>()
    })

    it('should allow params between parenthesis', () => {
      type Input = PathParamNames<'/endpoint/:param1/(:param2)'>
      //    ^?
      expectTypeOf<Input>().toEqualTypeOf<'param1' | 'param2'>()
    })
  })
})
