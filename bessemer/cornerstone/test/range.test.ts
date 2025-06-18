import { Ranges } from '@bessemer/cornerstone'
import { Bounds } from '@bessemer/cornerstone/range'
import Zod from 'zod'

test('Ranges.bounds', () => {
  expect(Ranges.of([1, 2])).toEqual([1, 2])
  expect(Ranges.of([1, null])).toEqual([1, null])
  expect(Ranges.of([null, null])).toEqual([null, null])
  expect(Ranges.of([null, 2])).toEqual([null, 2])
  expect(Ranges.of([1])).toEqual([1, null])
  expect(Ranges.of([1, undefined])).toEqual([1, null])

  const NumericBoundsSchema = Ranges.schema(Zod.number())
  type NumericBounds = Zod.infer<typeof NumericBoundsSchema>

  const nativeBoundsType: Bounds<number> = NumericBoundsSchema.parse([1, 2])
  const zodBoundsType: NumericBounds = Ranges.of([1, 2])

  expect(nativeBoundsType).toEqual([1, 2])
  expect(zodBoundsType).toEqual([1, 2])
})
