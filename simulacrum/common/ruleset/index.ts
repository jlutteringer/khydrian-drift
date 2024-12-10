import { Trait } from '@simulacrum/common/trait'
import { Referencable, Reference } from '@simulacrum/util/reference'
import { ResourcePoolDefinition } from '@simulacrum/common/resource-pool'
import { LoadoutType } from '@simulacrum/common/loadout'
import { ProgressionTable } from '@simulacrum/common/progression-table'
import { Effect } from '@simulacrum/common/effect'
import { Attribute } from '@simulacrum/common/attribute'
import { Ability } from '@simulacrum/common/ability'

export type RulesetReference = Reference<'Ruleset'>

export type Ruleset = Referencable<RulesetReference> & {
  name: string
  creatureAttributes: Array<Attribute<unknown>>
  characterAttributes: Array<Attribute<unknown>>
  traits: Array<Trait>
  abilities: Array<Ability>
  resourcePools: Array<ResourcePoolDefinition>
  loadoutTypes: Array<LoadoutType>
  progressionTable: ProgressionTable<Effect>
}
