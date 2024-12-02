import { Ruleset } from '@khydrian-drift/common/ruleset'
import {
  AdvancedOperations,
  Arsenal,
  BaselineQuickGuy,
  Commando,
  Momentum,
  OfficerTrait,
  SentinelTrait,
  SoldiersStamina,
} from '@khydrian-drift/rulesets/khydrian-drift/class/class-commando'
import { BasicCombatTraining } from '@khydrian-drift/rulesets/khydrian-drift/archetype/archetype-combat'
import { References } from '@khydrian-drift/util'
import { TacticPoints } from '@khydrian-drift/rulesets/khydrian-drift/resource-pool'
import { AdvancedHardpointLoadoutSlot, GeneralLoadoutSlot } from '@khydrian-drift/rulesets/khydrian-drift/loadout'
import { Effects, Traits } from '@khydrian-drift/common'
import { Class } from '@khydrian-drift/rulesets/khydrian-drift/archetype'

export const KhydrianDrift: Ruleset = {
  reference: References.reference('fc4174ae-4496-42bb-9775-f77dc7f20101', 'Ruleset', 'Khydrian Drift'),
  name: 'Khydrian Drift',
  traits: [Commando, BasicCombatTraining, Arsenal, SoldiersStamina, Momentum, OfficerTrait, AdvancedOperations, SentinelTrait, BaselineQuickGuy],
  resourcePools: [TacticPoints],
  loadoutTypes: [GeneralLoadoutSlot, AdvancedHardpointLoadoutSlot],
  progressionTable: {
    1: [Effects.gainTrait(Traits.filter({ archetypes: [Class] }))],
    2: [Effects.gainTrait(Traits.filterNone())],
    3: [Effects.gainTrait(Traits.filterNone())],
    4: [Effects.gainTrait(Traits.filterNone())],
    5: [Effects.gainTrait(Traits.filterNone())],
    6: [Effects.gainTrait(Traits.filterNone())],
    7: [Effects.gainTrait(Traits.filterNone())],
    8: [Effects.gainTrait(Traits.filterNone())],
    9: [Effects.gainTrait(Traits.filterNone())],
    10: [Effects.gainTrait(Traits.filterNone())],
  },
}
