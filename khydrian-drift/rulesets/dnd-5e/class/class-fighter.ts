import { Archetypes, Effects, Traits } from '@khydrian-drift/common'
import { Class } from '@khydrian-drift/rulesets/dnd-5e/archetype'
import { Expressions } from '@khydrian-drift/util/expression'
import { SelectFightingStyle } from '@khydrian-drift/rulesets/dnd-5e/archetype/fighting-style'
import { CharacterAttributes, CharacterValues } from '@khydrian-drift/common/character/character'
import { CharacterOptions } from '@khydrian-drift/common/character'

export const Fighter = Traits.defineTrait('143dad4d-9496-4a73-927c-c77c6b008282', {
  name: 'Fighter',
  description: '',
  archetypes: [Class],
  effects: [
    Effects.modifyAttribute(CharacterAttributes.VitalityPool, 10),
    Effects.gainCharacterOption(SelectFightingStyle),
    Effects.descriptive('Second Wind!'),
  ],
})

export const Fighter2 = Traits.defineTrait('da3e0304-f824-4231-9329-05c8889aa0cd', {
  name: 'Fighter Level 2',
  description: '',
  prerequisites: [Expressions.contains(CharacterValues.Traits, [Fighter.reference])],
  archetypes: [Class],
  effects: [Effects.modifyAttribute(CharacterAttributes.VitalityPool, 6), Effects.descriptive('Action Surge!'), Effects.descriptive('Tactical Mind')],
})

export const FighterSubclass = Archetypes.defineArchetype('5a40dddd-84a9-4de3-ae23-575f85e265cb', { name: 'Fighter Subclass' })
export const SelectFighterSubclass = CharacterOptions.selectTraitOption('f593fd03-9e94-4e11-ba7e-8723e3fa6755', { archetypes: [FighterSubclass] })

export const Fighter3 = Traits.defineTrait('a9fb4e9c-78b6-4067-b4f6-db6e831c53dc', {
  name: 'Fighter Level 3',
  description: '',
  prerequisites: [Expressions.contains(CharacterValues.Traits, [Fighter2.reference])],
  archetypes: [Class],
  effects: [Effects.modifyAttribute(CharacterAttributes.VitalityPool, 6), Effects.gainCharacterOption(SelectFighterSubclass)],
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
