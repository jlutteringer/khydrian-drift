import { Sets } from '@bessemer/cornerstone'

test('Sets.permute', () => {
  expect(Sets.permute(['a', 'b', 'c'])).toEqual([
    ['a', 'b', 'c'],
    ['a', 'c', 'b'],
    ['b', 'a', 'c'],
    ['b', 'c', 'a'],
    ['c', 'a', 'b'],
    ['c', 'b', 'a'],
  ])
})

test('Sets.properPowerSet', () => {
  expect(Sets.properPowerSet(['a', 'b', 'c'])).toEqual([['a'], ['b'], ['a', 'b'], ['c'], ['a', 'c'], ['b', 'c'], ['a', 'b', 'c']])
})

test('Sets.powerSet', () => {
  expect(Sets.powerSet(['a', 'b', 'c'])).toEqual([[], ['a'], ['b'], ['a', 'b'], ['c'], ['a', 'c'], ['b', 'c'], ['a', 'b', 'c']])
})
