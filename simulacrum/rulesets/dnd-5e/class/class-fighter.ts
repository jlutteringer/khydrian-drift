import { Abilities, Archetypes, Attributes, Effects, Traits } from '@simulacrum/common'
import { Class } from '@simulacrum/rulesets/dnd-5e/archetype'
import { Expressions } from '@simulacrum/util/expression'
import { SelectFightingStyle } from '@simulacrum/rulesets/dnd-5e/archetype/fighting-style'
import { CharacterOptions } from '@simulacrum/common/character'
import { PlayerCharacteristics } from '@simulacrum/rulesets/dnd-5e/characteristic'
import { CharacterValues } from '@simulacrum/common/character/character'
import { ActionType } from '@simulacrum/common/ability'
import { RelativeAmount, TimeUnit } from '@simulacrum/common/types'
import { Patches } from '@simulacrum/util'

export const SecondWind = Abilities.defineAbility('5783fc7f-7915-40c7-8a51-8406e4b82bf2', {
  name: 'Second Wind',
  description: '',
  actions: [
    {
      name: 'Use Second Wind',
      description: '',
      action: ActionType.Bonus,
      costs: [
        {
          cost: 1,
          resource: {
            size: 2,
            refresh: [
              {
                period: TimeUnit.LongRest,
                amount: RelativeAmount.All,
              },
              {
                period: TimeUnit.ShortRest,
                amount: 1,
              },
            ],
          },
        },
      ],
    },
  ],
})

export const Fighter = Traits.defineTrait('143dad4d-9496-4a73-927c-c77c6b008282', {
  name: 'Fighter',
  description: '',
  archetypes: [Class],
  effects: [
    Effects.modifyCharacteristic(PlayerCharacteristics.HitPoints, Attributes.modifier(Patches.sum(10))),
    Effects.gainCharacterOption(SelectFightingStyle),
    Effects.descriptive('Weapon Mastery!'),
    Effects.gainAbility(SecondWind),
  ],
})

export const ActionSurge = Abilities.defineAbility('a781f8be-1a9b-403d-84d7-155c997d01b3', {
  name: 'Action Surge',
  description: '',
  actions: [
    {
      action: ActionType.Bonus,
      costs: [
        {
          cost: 1,
          resource: {
            size: 1,
            refresh: [
              {
                period: TimeUnit.ShortRest,
                amount: RelativeAmount.All,
              },
            ],
          },
        },
      ],
    },
  ],
})

export const Fighter2 = Traits.defineTrait('da3e0304-f824-4231-9329-05c8889aa0cd', {
  name: 'Fighter Level 2',
  description: '',
  prerequisites: [Expressions.contains(CharacterValues.Traits, [Fighter.reference])],
  archetypes: [Class],
  effects: [
    Effects.modifyCharacteristic(PlayerCharacteristics.HitPoints, Attributes.modifier(Patches.sum(6))),
    Effects.gainAbility(ActionSurge),
    Effects.descriptive('Tactical Mind'),
  ],
})

export const FighterSubclass = Archetypes.defineArchetype('5a40dddd-84a9-4de3-ae23-575f85e265cb', { name: 'Fighter Subclass' })
export const SelectFighterSubclass = CharacterOptions.selectTraitOption('f593fd03-9e94-4e11-ba7e-8723e3fa6755', { archetypes: [FighterSubclass] })

export const Fighter3 = Traits.defineTrait('a9fb4e9c-78b6-4067-b4f6-db6e831c53dc', {
  name: 'Fighter Level 3',
  description: '',
  prerequisites: [Expressions.contains(CharacterValues.Traits, [Fighter2.reference])],
  archetypes: [Class],
  effects: [
    Effects.modifyCharacteristic(PlayerCharacteristics.HitPoints, Attributes.modifier(Patches.sum(6))),
    Effects.gainCharacterOption(SelectFighterSubclass),
  ],
})

export const BattleMaster = Traits.defineTrait('c2cfc67d-e22d-4343-9806-00dc1427e6a2', {
  name: 'Battle Master',
  description: '',
  archetypes: [FighterSubclass],
  effects: [Effects.descriptive('Combat Superiority!'), Effects.descriptive('Student of War!')],
})

export const Champion = Traits.defineTrait('791c8fdd-6731-4962-be17-ce79f71866be', {
  name: 'Champion',
  description: '',
  archetypes: [FighterSubclass],
  effects: [Effects.descriptive('Improved Critical!'), Effects.descriptive('Remarkable Athlete!')],
})

export const EldritchKnight = Traits.defineTrait('109f80f6-85b8-417d-8fda-36d8b844b158', {
  name: 'Eldritch Knight',
  description: '',
  archetypes: [FighterSubclass],
  effects: [Effects.descriptive('Spells!'), Effects.descriptive('War Bond!')],
})

export const PsiWarrior = Traits.defineTrait('c1f4c734-9205-4664-9cae-f2a3368c8cfb', {
  name: 'Psi Warrior',
  description: '',
  archetypes: [FighterSubclass],
  effects: [Effects.descriptive('Psionic Power!')],
})
