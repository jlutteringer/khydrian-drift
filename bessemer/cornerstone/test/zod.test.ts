import { Json, ZodUtil } from '@bessemer/cornerstone'
import Zod from 'zod'

test('Zod.parseJson', () => {
  const result = ZodUtil.parseJson(Zod.object({ key: Zod.string() }), '{ "key": "hello" }')
  console.log(Json.parse('{ "key": "hello" }'))
  console.log(result)
})
