import { ZodUtil } from '@bessemer/cornerstone'
import Zod from 'zod'

test('Zod.parseJson', () => {
  const result = ZodUtil.parseJson(Zod.object({ key: Zod.string() }), '{ "key": "hello" }')
})
