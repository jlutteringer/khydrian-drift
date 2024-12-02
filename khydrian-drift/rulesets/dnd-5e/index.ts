import { Ruleset } from '@khydrian-drift/common/ruleset'
import { References } from '@khydrian-drift/util'
import { Effects, Traits } from '@khydrian-drift/common'
import { DndClass } from '@khydrian-drift/rulesets/dnd-5e/archetype'
import { Fighter } from '@khydrian-drift/rulesets/dnd-5e/class/class-fighter'

export const Dnd5e: Ruleset = {
  reference: References.reference('ca894259-d62d-4398-b417-cb4f0adf4ffe', 'Ruleset', 'Dungeons and Dragons 5e'),
  name: 'Dungeons and Dragons 5e',
  traits: [Fighter],
  resourcePools: [],
  loadoutTypes: [],
  progressionTable: {
    1: [Effects.gainTrait(Traits.filter({ archetypes: [DndClass] }))],
  },
}
