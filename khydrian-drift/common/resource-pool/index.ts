import { Referencable } from '@khydrian-drift/util/reference'
import { CooldownRate } from '@khydrian-drift/common/types'
import { Expression } from '@khydrian-drift/util/expression'

export type ResourcePoolReference = {}

export type ResourcePoolProps = {
  name: string
  description: string
  size: Expression<number>
  refresh: CooldownRate
}

export type ResourcePool = Referencable<ResourcePoolReference> & ResourcePoolProps & {}

export type ResourcePoolModification = {
  resource: ResourcePoolReference
  // JOHN :(
  size: Expression<number>
}

export const defineResourcePool = (props: ResourcePoolProps): ResourcePool => {
  // JOHN
  return null!
}
