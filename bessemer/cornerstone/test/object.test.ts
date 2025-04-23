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

test('Objects.parsePath', () => {
  expect(Objects.parsePath('')).toEqual(Objects.path([]))
  expect(Objects.parsePath('this')).toEqual(Objects.path(['this']))
  expect(Objects.parsePath('this.is[2].a.path')).toEqual(Objects.path(['this', 'is', 2, 'a', 'path']))
  expect(Objects.parsePath('this.is[2].a.path[1]')).toEqual(Objects.path(['this', 'is', 2, 'a', 'path', 1]))
})

type Address = {
  addressLine1: string
  addressLine2: string | null
  postcode?: number
}

type Location = {
  name: string
  address: Address
}

type Person = {
  id: number
  name: string
  age: number
  pets: Array<string>
  primaryAddress: Address
  residences: Array<Location>
}

const person: Person = {
  id: 1234,
  name: 'Bob Bobson',
  age: 30,
  pets: ['Fishy Fish', 'Yogi', 'General Bismark'],
  primaryAddress: {
    addressLine1: '123 Fake Street.',
    addressLine2: 'Apt 6',
    postcode: 77586,
  },
  residences: [
    {
      name: 'Winter Estate',
      address: {
        addressLine1: 'Siberia',
        addressLine2: null,
        postcode: 34534,
      },
    },
    {
      name: 'Summer Palace',
      address: {
        addressLine1: '456 Palace Avenue',
        addressLine2: null,
      },
    },
  ],
}

test('Objects.getPathValue', () => {
  expect(Objects.getPathValue(person, 'id')).toEqual(1234)
  expect(Objects.getPathValue(person, 'pets[1]')).toEqual('Yogi')
  expect(Objects.getPathValue(person, 'primaryAddress.addressLine1')).toEqual('123 Fake Street.')
  expect(Objects.getPathValue(person, 'residences[0].address')).toEqual({
    addressLine1: 'Siberia',
    addressLine2: null,
    postcode: 34534,
  })
  expect(Objects.getPathValue(person, 'residences[2].address')).toEqual(undefined)
  expect(Objects.getPathValue(person, 'residences.address[0]')).toEqual(undefined)
})

test('Objects.applyPathValue', () => {
  {
    const modifiedPerson = Objects.applyPathValue(person, 'primaryAddress.addressLine1', 'Changed!') as Person
    expect(modifiedPerson.primaryAddress.addressLine1).toEqual('Changed!')
    expect(person.primaryAddress.addressLine1).toEqual('123 Fake Street.')
  }

  {
    const modifiedPerson = Objects.applyPathValue(person, 'residences[0].address', 'Changed!') as Person
    expect(modifiedPerson.residences[0]!.address).toEqual('Changed!')
  }

  {
    const modifiedPerson = Objects.applyPathValue(person, 'residences[3].address', 'Changed!') as Person
    expect(modifiedPerson).toEqual(undefined)
  }
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
