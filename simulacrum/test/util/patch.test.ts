import { Patches } from '@simulacrum/util'
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
        Patches.patch({
          name: 'Bobby',
          age: Patches.multiply(2),
          pets: Patches.set(['Burly Bear']),
          primaryAddress: {
            addressLine2: 'New Apartment',
          },
        }),
      ],
      Expressions.defaultEvaluator()
    )

    expect(originalPerson.name).toEqual('Bob Bobson')
    expect(updatedPerson.id).toEqual(originalPerson.id)
    expect(updatedPerson.primaryAddress.addressLine1).toEqual(originalPerson.primaryAddress.addressLine1)

    expect(updatedPerson.name).toEqual('Bobby')
    expect(updatedPerson.age).toEqual(60)
    expect(updatedPerson.primaryAddress.addressLine2).toEqual('New Apartment')
    expect(updatedPerson.pets).toEqual(['Burly Bear'])
  }

  {
    const updatedPerson = Patches.resolve(
      originalPerson,
      [
        Patches.patch({
          pets: Patches.concatenate(['Burly Bear']),
          primaryAddress: Patches.set({
            addressLine1: 'Another Street',
            addressLine2: 'Apt 7',
          }),
        }),
      ],
      Expressions.defaultEvaluator()
    )

    expect(updatedPerson.pets).toEqual([...originalPerson.pets, 'Burly Bear'])
    expect(updatedPerson.primaryAddress).toEqual({
      addressLine1: 'Another Street',
      addressLine2: 'Apt 7',
    })
  }

  {
    const updatedPerson = Patches.resolve(
      originalPerson,
      [
        Patches.patch({
          residences: [
            {
              name: 'Winter Chalet',
            },
            {
              address: {
                addressLine1: 'Address Line 1 Changed!',
              },
            },
          ],
        }),
      ],
      Expressions.defaultEvaluator()
    )

    expect(updatedPerson.residences.length).toEqual(2)
    expect(updatedPerson.residences[0].name).toEqual('Winter Chalet')
    expect(updatedPerson.residences[0].address.addressLine1).toEqual('Siberia')
    expect(updatedPerson.residences[1].name).toEqual('Summer Palace')
    expect(updatedPerson.residences[1].address.addressLine1).toEqual('Address Line 1 Changed!')
  }

  {
    const updatedPerson = Patches.resolve(
      originalPerson,
      [
        Patches.patch({
          residences: [
            {},
            {
              address: Patches.set({
                addressLine1: 'Liberia',
                addressLine2: null,
              }),
            },
          ],
        }),
      ],
      Expressions.defaultEvaluator()
    )

    expect(updatedPerson.residences[1].address).toEqual({
      addressLine1: 'Liberia',
      addressLine2: null,
    })
  }
})
