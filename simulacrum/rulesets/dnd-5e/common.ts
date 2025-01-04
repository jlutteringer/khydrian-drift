import { Abilities } from '@simulacrum/common'
import { ActionType } from '@simulacrum/common/ability'
import { RelativeAmount, TimeUnit } from '@simulacrum/common/types'
import { CharacterValues } from '@simulacrum/common/character/character'

export const Dodge = Abilities.defineAbility('b53bd920-1996-47ee-9b90-eebeef1abde2', {
  name: 'Dodge',
  description: '',
  actions: [
    {
      action: ActionType.Standard,
    },
  ],
})

export const Disengage = Abilities.defineAbility('ec9ee81a-807d-44ed-a3e5-9513d9ce57b3', {
  name: 'Disengage',
  description: '',
  actions: [
    {
      action: ActionType.Standard,
    },
  ],
})

export const Dash = Abilities.defineAbility('e75edabf-54a8-4b20-b7eb-555c44a4d0eb', {
  name: 'Dash',
  description: '',
  actions: [
    {
      action: ActionType.Standard,
    },
  ],
})

// TODO healing surge is going to need its own resource pool or something...
// TODO need a way to indicate only useable during a rest...
export const HealingSurge = Abilities.defineAbility('e5df0430-9c73-49e3-bd76-675f74a6e031', {
  name: 'Healing Surge',
  description: '',
  actions: [
    {
      action: ActionType.Standard,
      costs: [{ cost: 1, resource: { size: CharacterValues.Level, refresh: [{ period: TimeUnit.LongRest, amount: RelativeAmount.Half }] } }],
    },
  ],
})
