import { Ruleset } from '@khydrian-drift/common/ruleset'
import {
  AdvancedOperations,
  Arsenal,
  BaselineQuickGuy,
  CommandoClass,
  Momentum,
  OfficerTrait,
  SentinelTrait,
  SoldiersStamina,
} from '@khydrian-drift/rulesets/khydrian-drift/class/class-commando'
import { BasicCombatTraining } from '@khydrian-drift/rulesets/khydrian-drift/archetype/archetype-combat'
import { References } from '@khydrian-drift/util'
import { TacticPoints } from '@khydrian-drift/rulesets/khydrian-drift/resource-pool'
import { AdvancedHardpointLoadoutSlot, GeneralLoadoutSlot } from '@khydrian-drift/rulesets/khydrian-drift/loadout'
import { Effects } from '@khydrian-drift/common'
import { TraitFilter } from '@khydrian-drift/common/trait'

export const KhydrianDrift: Ruleset = {
  reference: References.reference('fc4174ae-4496-42bb-9775-f77dc7f20101', 'Ruleset', 'Khydrian Drift'),
  name: 'Khydrian Drift',
  classes: [CommandoClass],
  traits: [BasicCombatTraining, Arsenal, SoldiersStamina, Momentum, OfficerTrait, AdvancedOperations, SentinelTrait, BaselineQuickGuy],
  resourcePools: [TacticPoints],
  loadoutTypes: [GeneralLoadoutSlot, AdvancedHardpointLoadoutSlot],
  progressionTable: {
    2: [Effects.gainTrait(TraitFilter.Any)],
  },
}
