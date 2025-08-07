import { ZodUtil } from '@bessemer/cornerstone'
import Zod from 'zod/v4'

test('Zod.parseJson', () => {
  const result = ZodUtil.parseJson(Zod.object({ key: Zod.string() }), '{ "key": "hello" }')
})
