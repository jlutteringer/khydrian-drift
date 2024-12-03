import { Ruleset } from '@khydrian-drift/common/ruleset'
import { References } from '@khydrian-drift/util'
import { Effects, Traits } from '@khydrian-drift/common'
import { Fighter, Fighter2 } from '@khydrian-drift/rulesets/dnd-5e/class/class-fighter'
import { Archery, BlindFighting, Defense } from '@khydrian-drift/rulesets/dnd-5e/archetype/fighting-style'
import { Class } from '@khydrian-drift/rulesets/dnd-5e/archetype'
import { Barbarian } from '@khydrian-drift/rulesets/dnd-5e/class/class-barbarian'

export const Level1ClassOption = 'afbef236-17a0-464f-b2d0-cb01ecf7931a'

export const Dnd5e: Ruleset = {
  reference: References.reference('ca894259-d62d-4398-b417-cb4f0adf4ffe', 'Ruleset', 'Dungeons and Dragons 5e'),
  name: 'Dungeons and Dragons 5e',
  traits: [Archery, BlindFighting, Defense, Fighter, Fighter2, Barbarian],
  resourcePools: [],
  loadoutTypes: [],
  progressionTable: {
    1: [Effects.gainTrait(Level1ClassOption, Traits.filter({ archetypes: [Class] }))],
    2: [Effects.gainTrait('364a5b30-7f19-40ef-b430-b079b65cc4b8', Traits.filter({ archetypes: [Class] }))],
  },
}
