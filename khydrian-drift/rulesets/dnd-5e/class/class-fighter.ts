import { Effects, Traits } from '@khydrian-drift/common'
import { CharacterAttributes, CharacterOptions } from '@khydrian-drift/common/character'
import { Class } from '@khydrian-drift/rulesets/dnd-5e/archetype'
import { Expressions } from '@khydrian-drift/util/expression'
import { FightingStyle } from '@khydrian-drift/rulesets/dnd-5e/archetype/fighting-style'

export const Fighter = Traits.defineTrait('143dad4d-9496-4a73-927c-c77c6b008282', {
  name: 'Fighter',
  description: '',
  archetypes: [Class],
  effects: [
    Effects.modifyAttribute(CharacterAttributes.VitalityPool, 10),
    Effects.gainTrait('0dc1e769-c1a7-42aa-bb9b-67972b6e2216', { archetypes: [FightingStyle] }),
    Effects.descriptive('Second Wind!'),
  ],
})

export const Fighter2 = Traits.defineTrait('da3e0304-f824-4231-9329-05c8889aa0cd', {
  name: 'Fighter Level 2',
  description: '',
  prerequisites: [Expressions.contains(CharacterOptions.Traits, [Fighter.reference])],
  archetypes: [Class],
  effects: [Effects.modifyAttribute(CharacterAttributes.VitalityPool, 6), Effects.descriptive('Action Surge!'), Effects.descriptive('Tactical Mind')],
})
