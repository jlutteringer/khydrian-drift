import { Ruleset } from '@simulacrum/common/ruleset'
import {
  AdvancedOperations,
  Arsenal,
  BaselineQuickGuy,
  Commando,
  Momentum,
  OfficerTrait,
  SentinelTrait,
  SoldiersStamina,
} from '@simulacrum/rulesets/khydrian-drift/class/class-commando'
import { BasicCombatTraining } from '@simulacrum/rulesets/khydrian-drift/archetype/archetype-combat'
import { References } from '@simulacrum/util'
import { TacticPoints } from '@simulacrum/rulesets/khydrian-drift/resource-pool'
import { AdvancedHardpointLoadoutSlot, GeneralLoadoutSlot } from '@simulacrum/rulesets/khydrian-drift/loadout'
import { Effects, Traits } from '@simulacrum/common'
import { Class } from '@simulacrum/rulesets/khydrian-drift/archetype'
import { CharacterOptions } from '@simulacrum/common/character'
import { CreatureCharacteristics, PlayerCharacteristics } from '@simulacrum/rulesets/khydrian-drift/characteristic'

export const SelectClassOption = CharacterOptions.selectTraitOption('98e42317-8a5c-45a2-9700-fec314750a37', { archetypes: [Class] })
export const SelectTraitOption = CharacterOptions.selectTraitOption('5a1a65ff-6c10-4dd0-85a8-393c196efd2b', Traits.filterNone())

export const KhydrianDrift: Ruleset = {
  reference: References.reference('fc4174ae-4496-42bb-9775-f77dc7f20101', 'Ruleset', 'Khydrian Drift'),
  name: 'Khydrian Drift',
  creatureCharacteristics: Object.values(CreatureCharacteristics),
  playerCharacteristics: Object.values(PlayerCharacteristics),
  traits: [Commando, BasicCombatTraining, Arsenal, SoldiersStamina, Momentum, OfficerTrait, AdvancedOperations, SentinelTrait, BaselineQuickGuy],
  abilities: [],
  resourcePools: [TacticPoints],
  loadoutTypes: [GeneralLoadoutSlot, AdvancedHardpointLoadoutSlot],
  progressionTable: {
    1: [Effects.gainCharacterOption(SelectClassOption)],
    2: [Effects.gainCharacterOption(SelectTraitOption)],
    3: [Effects.gainCharacterOption(SelectTraitOption)],
    4: [Effects.gainCharacterOption(SelectTraitOption)],
    5: [Effects.gainCharacterOption(SelectTraitOption)],
    6: [Effects.gainCharacterOption(SelectTraitOption)],
    7: [Effects.gainCharacterOption(SelectTraitOption)],
    8: [Effects.gainCharacterOption(SelectTraitOption)],
    9: [Effects.gainCharacterOption(SelectTraitOption)],
    10: [Effects.gainCharacterOption(SelectTraitOption)],
  },
}
