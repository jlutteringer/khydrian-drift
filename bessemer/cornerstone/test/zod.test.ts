import { Json, Zod } from '@bessemer/cornerstone'

test('Zod.parseJson', () => {
  const result = Zod.parseJson(Zod.object({ key: Zod.string() }), '{ "key": "hello" }')
  console.log(Json.parse('{ "key": "hello" }'))
  console.log(result)
})
