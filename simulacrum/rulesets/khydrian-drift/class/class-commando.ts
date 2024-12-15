import { Attributes, Effects, Traits } from '@simulacrum/common'
import { Expressions, NumericExpressions } from '@simulacrum/util/expression'
import { BasicCombatTraining } from '@simulacrum/rulesets/khydrian-drift/archetype/archetype-combat'
import { AdvancedHardpointLoadoutSlot, GeneralLoadoutSlot } from '@simulacrum/rulesets/khydrian-drift/loadout'
import { TacticPoints } from '@simulacrum/rulesets/khydrian-drift/resource-pool'
import { Class } from '@simulacrum/rulesets/khydrian-drift/archetype'
import { CharacterValues } from '@simulacrum/common/character/character'
import { PlayerCharacteristics } from '@simulacrum/rulesets/khydrian-drift/characteristic'
import { Patches } from '@simulacrum/util'

export const Commando = Traits.defineTrait('e0b5ad7e-6e8b-4416-8a7c-41bab05993d3', {
  name: 'Commando',
  description: '',
  archetypes: [Class],
  effects: [
    Effects.modifyCharacteristic(PlayerCharacteristics.VitalityPool, Attributes.modifier(Patches.sum(NumericExpressions.multiply([CharacterValues.Level, 2])))),
    Effects.gainTrait(BasicCombatTraining),
    Effects.modifyLoadoutSlotQuantity(GeneralLoadoutSlot, 2),
    Effects.modifyLoadoutSlotQuantity(AdvancedHardpointLoadoutSlot, 1),
  ],
})

export const Arsenal = Traits.defineTrait('c44fa6b0-8cf1-412b-93be-972d2c7eff8d', {
  name: 'Arsenal',
  description: '',
  prerequisites: [Traits.traitPrerequisite(Commando)],
  effects: [Effects.descriptive('All equipped weapons are considered wielded.')],
})

export const SoldiersStamina = Traits.defineTrait('41c63a82-3304-44b2-8f0b-b0d2e4e88e27', {
  name: "Soldier's Stamina",
  description: '',
  prerequisites: [Traits.traitPrerequisite(Commando)],
  effects: [Effects.modifyHealingSurgeQuantity(2)],
})

export const Momentum = Traits.defineTrait('7a3e377a-f2d4-41ce-b7f2-866538a517ce', {
  name: 'Momentum',
  description: '',
  prerequisites: [Traits.traitPrerequisite(Commando)],
  effects: [
    Effects.modifyCharacteristic(
      PlayerCharacteristics.MovementSpeed,
      Attributes.modifier(Patches.sum(NumericExpressions.floor(PlayerCharacteristics.Agility.variable, 1)))
    ),
  ],
})

export const BaselineQuickGuy = Traits.defineTrait('asdasdaSDasdasDasdasDd', {
  name: 'BaselineQuickGuy',
  description: '',
  prerequisites: [Traits.traitPrerequisite(Commando)],
  effects: [Effects.modifyCharacteristic(PlayerCharacteristics.MovementSpeed, Attributes.modifier(Patches.set(6)))],
})

export const Officer = Traits.reference('cf3df79a-c906-49c5-8756-ee14bd4b26a5', 'Officer')
export const Sentinel = Traits.reference('7aa06ac1-cd35-40e3-b1d5-bb62eeb60443', 'Sentinel')

export const OfficerTrait = Traits.defineTrait(Officer, {
  name: 'Officer',
  description: '',
  prerequisites: [Traits.traitPrerequisite(Commando), Traits.traitPrerequisite(Momentum), Expressions.not(Traits.traitPrerequisite(Sentinel))],
  effects: [Effects.gainResourcePool(TacticPoints), Effects.modifyLoadoutSlotQuantity(GeneralLoadoutSlot, 2)],
})

export const AdvancedOperations = Traits.defineTrait('cf015d5a-f427-4eea-9798-caf9700fcacd', {
  name: 'Advanced Operations',
  description: '',
  prerequisites: [Traits.traitPrerequisite(Commando), Traits.traitPrerequisite(Officer)],
  effects: [
    // JOHN this solution doesn't work - its supposed to add 2 not set 2
    Effects.modifyResourcePool({ resource: TacticPoints.reference, size: 2 }),
    Effects.modifyLoadoutSlotQuantity(GeneralLoadoutSlot, 2),
  ],
})

export const SentinelTrait = Traits.defineTrait(Sentinel, {
  name: 'Sentinel',
  description: '',
  prerequisites: [Traits.traitPrerequisite(Commando), Expressions.not(Traits.traitPrerequisite(Officer))],
  effects: [],
})
