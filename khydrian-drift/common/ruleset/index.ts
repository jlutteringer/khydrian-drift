import { Trait } from '@khydrian-drift/common/trait'
import { Referencable, Reference } from '@khydrian-drift/util/reference'
import { ResourcePool } from '@khydrian-drift/common/resource-pool'
import { LoadoutType } from '@khydrian-drift/common/loadout'
import { EffectProgressionTable } from '@khydrian-drift/common/progression-table'

export type RulesetReference = Reference<'Ruleset'>

export type Ruleset = Referencable<RulesetReference> & {
  name: string
  traits: Array<Trait>
  resourcePools: Array<ResourcePool>
  loadoutTypes: Array<LoadoutType>
  progressionTable: EffectProgressionTable
}
