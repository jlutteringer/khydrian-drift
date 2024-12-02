import { Class } from '@khydrian-drift/common/class'
import { Trait } from '@khydrian-drift/common/trait'
import { Referencable, Reference } from '@khydrian-drift/util/reference'
import { ResourcePool } from '@khydrian-drift/common/resource-pool'
import { LoadoutType } from '@khydrian-drift/common/loadout'
import { Effect } from '@khydrian-drift/common/effect'

export type RulesetReference = Reference<'Ruleset'>

export type Ruleset = Referencable<RulesetReference> & {
  name: string
  classes: Array<Class>
  traits: Array<Trait>
  resourcePools: Array<ResourcePool>
  loadoutTypes: Array<LoadoutType>
  progressionTable: Record<number, Array<Effect>>
}
