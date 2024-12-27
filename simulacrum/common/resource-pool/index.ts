import { RelativeAmount, TimeUnit } from '@simulacrum/common/types'
import { EvaluateExpression, Expression } from '@bessemer/cornerstone/expression'
import { Referencable, Reference, ReferenceType } from '@bessemer/cornerstone/reference'
import { Preconditions, References } from '@bessemer/cornerstone'
import { Application } from '@simulacrum/common/application'

export type ResourcePool = {
  size: Expression<number>
  refresh: Array<CooldownRate>
}

export type CooldownRate = {
  period: TimeUnit
  amount: Expression<number> | RelativeAmount
}

export type ResourcePoolReference = Reference<'ResourcePoolDefinition'>

export type ResourcePoolProps = ResourcePool & {
  name: string
  path: string
  description: string
}

export type ResourcePoolDefinition = ResourcePoolProps & Referencable<ResourcePoolReference> & {}

export type ResourcePoolState = {
  resource: ResourcePoolReference
  value: number
}

export type ResourceCost = {
  cost: Expression<number>
  resource: ResourcePool | ResourcePoolReference
}

export const defineResourcePool = (reference: ReferenceType<ResourcePoolReference>, props: ResourcePoolProps): ResourcePoolDefinition => {
  return {
    reference: References.reference(reference, 'ResourcePoolDefinition', props.name),
    ...props,
  }
}

export const getResourcePool = (resourcePool: ResourcePoolReference, application: Application): ResourcePoolDefinition => {
  const matchingResourcePool = application.client.ruleset.resourcePools.find((it) => References.equals(it.reference, resourcePool))
  Preconditions.isPresent(matchingResourcePool, () => `Unable to find Resource Pool for Reference: ${JSON.stringify(resourcePool)}`)
  return matchingResourcePool
}

export const buildInitialState = (
  reference: ResourcePoolReference,
  evaluate: EvaluateExpression,
  application: Application
): [string, ResourcePoolState] => {
  const resourcePool = getResourcePool(reference, application)
  return [
    resourcePool.path,
    {
      resource: resourcePool.reference,
      value: evaluate(resourcePool.size),
    },
  ]
}
