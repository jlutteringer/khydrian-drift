import { Ranges, Sets, Zod } from '@bessemer/cornerstone'
import { Bounds } from '@bessemer/cornerstone/range'

test('Ranges.bounds', () => {
  expect(Ranges.bounds([1, 2])).toEqual([1, 2])
  expect(Ranges.bounds([1, null])).toEqual([1, null])
  expect(Ranges.bounds([null, null])).toEqual([null, null])
  expect(Ranges.bounds([null, 2])).toEqual([null, 2])
  expect(Ranges.bounds([1])).toEqual([1, null])
  expect(Ranges.bounds([1, undefined])).toEqual([1, null])

  const NumericBoundsSchema = Ranges.boundsSchema(Zod.number())
  type NumericBounds = Zod.infer<typeof NumericBoundsSchema>

  const nativeBoundsType: Bounds<number> = NumericBoundsSchema.parse([1, 2])
  const zodBoundsType: NumericBounds = Ranges.bounds([1, 2])

  expect(nativeBoundsType).toEqual([1, 2])
  expect(zodBoundsType).toEqual([1, 2])
})