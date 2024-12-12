import { Patches } from '@simulacrum/util'
import { Patchable } from '@simulacrum/util/patch'
import { Expressions } from '@simulacrum/util/expression'

test('Patch Numbers', () => {
  {
    const value = Patches.resolve(5, [Patches.sum(1), Patches.sum(2), Patches.sum(3)], Expressions.defaultEvaluator())
    expect(value).toEqual(11)
  }

  {
    const value = Patches.resolve(5, [Patches.multiply(2), Patches.sum(2), Patches.multiply(2)], Expressions.defaultEvaluator())
    expect(value).toEqual(24)
  }

  {
    const value = Patches.resolve(5, [Patches.set(2), Patches.sum(2), Patches.set(5)], Expressions.defaultEvaluator())
    expect(value).toEqual(5)
  }
})

test('Patch Arrays', () => {
  // const a = Expressions.merge([
  //   [1, 2, 3],
  //   [4, 5, 6],
  // ])
})

test('Patch Objects', () => {
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

  type PersonPatch = Patchable<Person>

  const originalPerson: Person = {
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

  {
    const updatedPerson = Patches.resolve(
      originalPerson,
      [
        Patches.patch<Person>({
          name: 'Bobby',
          age: Patches.multiply(2),
          pets: Patches.set(['Fishy Fish', 'Yogi']),
          primaryAddress: {
            addressLine2: 'New Apartment',
          },
        }),
      ],
      Expressions.defaultEvaluator()
    )

    expect(originalPerson.name).toBe('Bob Bobson')
    expect(updatedPerson.id).toBe(originalPerson.id)
    expect(updatedPerson.primaryAddress.addressLine1).toBe(originalPerson.primaryAddress.addressLine1)

    expect(updatedPerson.name).toBe('Bobby')
    expect(updatedPerson.age).toBe(60)
    expect(updatedPerson.primaryAddress.addressLine2).toBe('New Apartment')
  }
})
