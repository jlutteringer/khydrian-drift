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
    1: [Effects.gainTrait('98e42317-8a5c-45a2-9700-fec314750a37', Traits.filter({ archetypes: [Class] }))],
    2: [Effects.gainTrait('5a1a65ff-6c10-4dd0-85a8-393c196efd2b', Traits.filterNone())],
    3: [Effects.gainTrait('7fa338c4-7271-4bca-8dee-de8a2812585d', Traits.filterNone())],
    4: [Effects.gainTrait('d0850b68-5c00-4265-896a-d85de1ab31b3', Traits.filterNone())],
    5: [Effects.gainTrait('4245f245-fd0e-4166-ae3d-b948a8e41de3', Traits.filterNone())],
    6: [Effects.gainTrait('ce5002b0-bb1e-46ab-b275-899cc14e7aa5', Traits.filterNone())],
    7: [Effects.gainTrait('74db5d10-6a77-46bd-a112-03a87be068d6', Traits.filterNone())],
    8: [Effects.gainTrait('e8fc43d7-4747-4796-985e-35c762ca4ede', Traits.filterNone())],
    9: [Effects.gainTrait('48dff07d-f0f1-4e8d-a08f-2f26544cc41d', Traits.filterNone())],
    10: [Effects.gainTrait('0c39ac11-6147-4326-bb1b-d65eceaee4f8', Traits.filterNone())],
  },
}
