import { Class } from '@khydrian-drift/common/class'
import { Trait } from '@khydrian-drift/common/trait'
import { Referencable, Reference } from '@khydrian-drift/util/reference'
import { ResourcePool } from '@khydrian-drift/common/resource-pool'
import { LoadoutType } from '@khydrian-drift/common/loadout'

export type RulesetReference = Reference<'Ruleset'>

export type Ruleset = Referencable<RulesetReference> & {
  name: string
  classes: Array<Class>
  traits: Array<Trait>
  resourcePools: Array<ResourcePool>
  loadoutTypes: Array<LoadoutType>
}
