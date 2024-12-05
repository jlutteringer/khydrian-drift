import { Trait } from '@khydrian-drift/common/trait'
import { Referencable, Reference } from '@khydrian-drift/util/reference'
import { ResourcePool } from '@khydrian-drift/common/resource-pool'
import { LoadoutType } from '@khydrian-drift/common/loadout'
import { ProgressionTable } from '@khydrian-drift/common/progression-table'
import { Effect } from '@khydrian-drift/common/effect'

export type RulesetReference = Reference<'Ruleset'>

export type Ruleset = Referencable<RulesetReference> & {
  name: string
  traits: Array<Trait>
  resourcePools: Array<ResourcePool>
  loadoutTypes: Array<LoadoutType>
  progressionTable: ProgressionTable<Effect>
}
