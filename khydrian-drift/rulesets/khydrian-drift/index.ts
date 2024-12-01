import { Ruleset } from '@khydrian-drift/common/ruleset'
import {
  AdvancedOperations,
  Arsenal,
  BaselineQuickGuy,
  CommandoClass,
  CommandoTraining,
  Momentum,
  OfficerTrait,
  SentinelTrait,
  SoldiersStamina,
} from '@khydrian-drift/rulesets/khydrian-drift/class/class-commando'
import { BasicCombatTraining } from '@khydrian-drift/rulesets/khydrian-drift/archetype/archetype-combat'
import { References } from '@khydrian-drift/util'
import { TacticPoints } from '@khydrian-drift/rulesets/khydrian-drift/resource-pool'
import { AdvancedHardpointLoadoutSlot, GeneralLoadoutSlot } from '@khydrian-drift/rulesets/khydrian-drift/loadout'

export const KhydrianDrift: Ruleset = {
  reference: References.reference('fc4174ae-4496-42bb-9775-f77dc7f20101', 'Ruleset', 'Khydrian Drift'),
  name: 'Khydrian Drift',
  classes: [CommandoClass],
  traits: [BasicCombatTraining, CommandoTraining, Arsenal, SoldiersStamina, Momentum, OfficerTrait, AdvancedOperations, SentinelTrait, BaselineQuickGuy],
  resourcePools: [TacticPoints],
  loadoutTypes: [GeneralLoadoutSlot, AdvancedHardpointLoadoutSlot],
}
