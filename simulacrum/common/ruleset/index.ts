import { Trait } from '@simulacrum/common/trait'
import { Referencable, Reference } from '@simulacrum/util/reference'
import { ResourcePool } from '@simulacrum/common/resource-pool'
import { LoadoutType } from '@simulacrum/common/loadout'
import { ProgressionTable } from '@simulacrum/common/progression-table'
import { Effect } from '@simulacrum/common/effect'

export type RulesetReference = Reference<'Ruleset'>

export type Ruleset = Referencable<RulesetReference> & {
  name: string
  traits: Array<Trait>
  resourcePools: Array<ResourcePool>
  loadoutTypes: Array<LoadoutType>
  progressionTable: ProgressionTable<Effect>
}
