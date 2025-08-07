import { Objects } from '@bessemer/cornerstone'

test('Objects.mergeAll', () => {
  expect(
    Objects.deepMergeAll([
      { one: 'First Value', two: 'Second Value', three: 'First Value' },
      { one: 'Update Value' },
      { one: 'Update Value 2', two: null, four: 'Fourth Value' },
      { three: undefined },
    ])
  ).toEqual({
    one: 'Update Value 2',
    two: null,
    three: 'First Value',
    four: 'Fourth Value',
  })
})

test('Objects.mapValues', () => {
  Objects.mapValues(
    {
      fred: { user: 'fred', age: 40 },
      pebbles: { user: 'pebbles', age: 1 },
    },
    (value) => {
      return 1
    }
  )
})
