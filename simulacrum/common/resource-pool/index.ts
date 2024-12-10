import { Referencable, Reference } from '@simulacrum/util/reference'
import { CooldownRateMutation, RelativeAmount, TimeUnit } from '@simulacrum/common/types'
import { Expression } from '@simulacrum/util/expression'
import { References } from '@simulacrum/util'

export type ResourcePool = {
  size: Expression<number>
  refresh: Array<CooldownRate>
}

export type CooldownRate = {
  period: TimeUnit
  amount: Expression<number> | RelativeAmount
}

export type ResourcePoolReference = Reference<'ResourcePoolDefinition'>

export type ResourcePoolProps = {
  name: string
  description: string
  resourcePool: ResourcePool
}

export type ResourcePoolDefinition = ResourcePoolProps & Referencable<ResourcePoolReference> & {}

export type ResourcePoolMutation = {
  resource: ResourcePoolReference

  size?: Expression<number>
  refresh?: CooldownRateMutation
}

export type ResourceCost = {
  cost: Expression<number>
  resource: ResourcePool | ResourcePoolReference
}

export const defineResourcePool = (reference: ResourcePoolReference | string, props: ResourcePoolProps): ResourcePoolDefinition => {
  return {
    reference: References.reference(reference, 'ResourcePoolDefinition', props.name),
    ...props,
  }
}
