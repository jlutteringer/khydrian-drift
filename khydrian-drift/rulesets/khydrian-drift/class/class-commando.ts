import { Classes, Effects, Traits } from '@khydrian-drift/common'
import { CharacterAttributes, CharacterProperties } from '@khydrian-drift/common/character'
import { Expressions, NumericExpressions } from '@khydrian-drift/util/expression'
import { BasicCombatTraining } from '@khydrian-drift/rulesets/khydrian-drift/archetype/archetype-combat'
import { AdvancedHardpointLoadoutSlot, GeneralLoadoutSlot } from '@khydrian-drift/rulesets/khydrian-drift/loadout'
import { TacticPoints } from '@khydrian-drift/rulesets/khydrian-drift/resource-pool'

export const Commando = Classes.reference('e0b5ad7e-6e8b-4416-8a7c-41bab05993d2', 'Commando')

export const CommandoTraining = Traits.defineTrait('74819149-e7be-484e-bb4b-27ec29740832', {
  name: 'CommandoTraining',
  description: '',
  prerequisites: [Traits.classPrerequisite(Commando)],
  effects: [
    Effects.gainTrait(BasicCombatTraining.reference),
    Effects.modifyLoadoutSlotQuantity(GeneralLoadoutSlot.reference, 2),
    Effects.modifyLoadoutSlotQuantity(AdvancedHardpointLoadoutSlot.reference, 1),
  ],
})

export const CommandoClass = Classes.defineClass(Commando, {
  name: 'Commando',
  vitalityIncrement: 1,
  startingTraits: [CommandoTraining.reference],
})

export const Arsenal = Traits.defineTrait('c44fa6b0-8cf1-412b-93be-972d2c7eff8d', {
  name: 'Arsenal',
  description: '',
  prerequisites: [Traits.classPrerequisite(Commando)],
  effects: [Effects.descriptive('All equipped weapons are considered wielded.')],
})

export const SoldiersStamina = Traits.defineTrait('41c63a82-3304-44b2-8f0b-b0d2e4e88e27', {
  name: "Soldier's Stamina",
  description: '',
  prerequisites: [Traits.classPrerequisite(Commando)],
  effects: [Effects.modifyHealingSurgeQuantity(2)],
})

export const Momentum = Traits.defineTrait('7a3e377a-f2d4-41ce-b7f2-866538a517ce', {
  name: 'Momentum',
  description: '',
  prerequisites: [Traits.classPrerequisite(Commando)],
  effects: [
    Effects.modifyAttribute(
      CharacterAttributes.MovementSpeed.reference,
      NumericExpressions.floor(CharacterProperties.Agility, 1),
      NumericExpressions.lessThan(CharacterProperties.VitalityPoints, NumericExpressions.multiply([CharacterProperties.VitalityPool, 0.5]))
    ),
    Effects.modifyAttribute(
      CharacterAttributes.MovementSpeed.reference,
      7, // TODO this should be 1
      Expressions.not(NumericExpressions.lessThan(CharacterProperties.VitalityPoints, NumericExpressions.multiply([CharacterProperties.VitalityPool, 0.5])))
    ),
  ],
})

export const BaselineQuickGuy = Traits.defineTrait('asdasdaSDasdasDasdasDd', {
  name: 'BaselineQuickGuy',
  description: '',
  prerequisites: [Traits.classPrerequisite(Commando)],
  effects: [
    Effects.assignAttribute(CharacterAttributes.MovementSpeed.reference, 6, NumericExpressions.lessThan(CharacterAttributes.MovementSpeed.variable, 6)),
  ],
})

export const Officer = Traits.reference('cf3df79a-c906-49c5-8756-ee14bd4b26a5', 'Officer')
export const Sentinel = Traits.reference('7aa06ac1-cd35-40e3-b1d5-bb62eeb60443', 'Sentinel')

export const OfficerTrait = Traits.defineTrait(Officer, {
  name: 'Officer',
  description: '',
  prerequisites: [Traits.classPrerequisite(Commando), Traits.traitPrerequisite(Momentum.reference), Expressions.not(Traits.traitPrerequisite(Sentinel))],
  effects: [Effects.gainResourcePool(TacticPoints.reference), Effects.modifyLoadoutSlotQuantity(GeneralLoadoutSlot.reference, 2)],
})

export const AdvancedOperations = Traits.defineTrait('cf015d5a-f427-4eea-9798-caf9700fcacd', {
  name: 'Advanced Operations',
  description: '',
  prerequisites: [Traits.classPrerequisite(Commando), Traits.traitPrerequisite(Officer)],
  effects: [
    // JOHN this solution doesn't work - its supposed to add 2 not set 2
    Effects.modifyResourcePool({ resource: TacticPoints.reference, size: 2 }),
    Effects.modifyLoadoutSlotQuantity(GeneralLoadoutSlot.reference, 2),
  ],
})

export const SentinelTrait = Traits.defineTrait(Sentinel, {
  name: 'Sentinel',
  description: '',
  prerequisites: [Traits.classPrerequisite(Commando), Expressions.not(Traits.traitPrerequisite(Officer))],
  effects: [],
})
