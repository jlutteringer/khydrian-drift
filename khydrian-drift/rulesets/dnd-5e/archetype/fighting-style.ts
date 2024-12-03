import { Archetypes, Effects, Traits } from '@khydrian-drift/common'

export const FightingStyle = Archetypes.defineArchetype('81126abc-71f9-4586-9c92-8272a9d2cff1', { name: 'Fighting Style' })

export const Archery = Traits.defineTrait('c34e35a7-4753-4e6b-8138-70708c622597', {
  name: 'Archery Fighting Style',
  description: '',
  archetypes: [FightingStyle],
  effects: [Effects.descriptive('Archery!')],
})

export const BlindFighting = Traits.defineTrait('3ccda400-0d2c-4d77-ba4f-b8822a1ffeeb', {
  name: 'Blind Fighting Style',
  description: '',
  archetypes: [FightingStyle],
  effects: [Effects.descriptive('BlindFighting!')],
})

export const Defense = Traits.defineTrait('b0729a45-8f19-4e72-adca-58350bdf945d', {
  name: 'Defense Fighting Style',
  description: '',
  archetypes: [FightingStyle],
  effects: [Effects.descriptive('Defense!')],
})
