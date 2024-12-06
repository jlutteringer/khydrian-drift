import { Referencable, Reference } from '@simulacrum/util/reference'
import { CooldownRate, CooldownRateMutation } from '@simulacrum/common/types'
import { Expression } from '@simulacrum/util/expression'
import { References } from '@simulacrum/util'

export type ResourcePoolReference = Reference<'ResourcePool'>

export type ResourcePoolProps = {
  name: string
  description: string

  size: Expression<number>
  refresh: CooldownRate
}

export type ResourcePool = Referencable<ResourcePoolReference> & ResourcePoolProps & {}

export type ResourcePoolMutation = {
  resource: ResourcePoolReference

  size?: Expression<number>
  refresh?: CooldownRateMutation
}

export const defineResourcePool = (reference: ResourcePoolReference | string, props: ResourcePoolProps): ResourcePool => {
  return {
    reference: References.reference(reference, 'ResourcePool', props.name),
    ...props,
  }
}
