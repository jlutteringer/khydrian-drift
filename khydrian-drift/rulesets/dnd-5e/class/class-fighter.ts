import { Effects, Traits } from '@khydrian-drift/common'
import { CharacterAttributes } from '@khydrian-drift/common/character'
import { DndClass } from '@khydrian-drift/rulesets/dnd-5e/archetype'

export const Fighter = Traits.defineTrait('e0c783d5-b1b7-4f9b-982b-9df98ce85b57', {
  name: 'Fighter',
  description: '',
  archetypes: [DndClass],
  effects: [Effects.modifyAttribute(CharacterAttributes.VitalityPool, 4)],
})
