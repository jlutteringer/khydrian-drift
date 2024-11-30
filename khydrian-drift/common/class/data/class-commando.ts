import { Classes, Effects, Traits } from '@khydrian-drift/common'
import { BasicCombatTraining } from '@khydrian-drift/common/archetype/data/archetype-combat'
import { AdvancedHardpointLoadoutSlot, GeneralLoadoutSlot } from '@khydrian-drift/common/loadout/data'
import { TacticPoints } from '@khydrian-drift/common/resource-pool/data'
import { CharacterProperties } from '@khydrian-drift/common/character'
import { Expressions, NumericExpressions } from '@khydrian-drift/util/expression'

export const Commando = Classes.reference('Commando')

export const CommandoTraining = Traits.defineTrait({
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

export const Arsenal = Traits.defineTrait({
  name: 'Arsenal',
  description: '',
  prerequisites: [Traits.classPrerequisite(Commando)],
  effects: [Effects.descriptive('All equipped weapons are considered wielded.')],
})

export const SoldiersStamina = Traits.defineTrait({
  name: "Soldier's Stamina",
  description: '',
  prerequisites: [Traits.classPrerequisite(Commando)],
  effects: [Effects.modifyHealingSurgeQuantity(2)],
})

export const Momentum = Traits.defineTrait({
  name: 'Momentum',
  description: '',
  prerequisites: [Traits.classPrerequisite(Commando)],
  // JOHN define conditional
  effects: [
    Effects.conditional(
      NumericExpressions.lessThan(CharacterProperties.VitalityPoints, NumericExpressions.multiply(CharacterProperties.VitalityPool, 0.5)),
      Effects.modifyMovementSpeed(NumericExpressions.min(CharacterProperties.Agility, 1)),
      Effects.modifyMovementSpeed(1)
    ),
  ],
})

export const Officer = Traits.reference('Officer')
export const Sentinel = Traits.reference('Sentinel')

export const OfficerTrait = Traits.defineTrait(Officer, {
  name: 'Officer',
  description: '',
  prerequisites: [Traits.classPrerequisite(Commando), Traits.traitPrerequisite(Momentum.reference), Traits.notPrerequisite(Traits.traitPrerequisite(Sentinel))],
  effects: [Effects.gainResourcePool(TacticPoints.reference), Effects.modifyLoadoutSlotQuantity(GeneralLoadoutSlot.reference, 2)],
})

export const AdvancedOperations = Traits.defineTrait(Officer, {
  name: 'Advanced Operations',
  description: '',
  prerequisites: [Traits.classPrerequisite(Commando), Traits.traitPrerequisite(Officer)],
  effects: [
    Effects.modifyResourcePool({ resource: TacticPoints.reference, size: Expressions.curry(NumericExpressions.sum(2)) }),
    Effects.modifyLoadoutSlotQuantity(GeneralLoadoutSlot.reference, 2),
  ],
})

export const SentinelTrait = Traits.defineTrait(Sentinel, {
  name: 'Sentinel',
  description: '',
  prerequisites: [Traits.classPrerequisite(Commando), Traits.notPrerequisite(Traits.traitPrerequisite(Officer))],
  effects: [],
})
