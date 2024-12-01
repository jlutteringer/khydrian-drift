import { Referencable, Reference } from '@khydrian-drift/util/reference'
import { CooldownRate, CooldownRateMutation } from '@khydrian-drift/common/types'
import { CurriedExpression, Expression } from '@khydrian-drift/util/expression'
import { References } from '@khydrian-drift/util'

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

  size?: Expression<number> | CurriedExpression<number, number>
  refresh?: CooldownRateMutation
}

export const defineResourcePool = (reference: ResourcePoolReference | string, props: ResourcePoolProps): ResourcePool => {
  return {
    reference: References.reference(reference, 'ResourcePool', props.name),
    ...props,
  }
}
